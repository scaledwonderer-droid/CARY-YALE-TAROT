(function initializeReadingApp() {
  "use strict";

  const positions = [
    { id: "past", en: "PAST", ja: "過去" },
    { id: "present", en: "PRESENT", ja: "現在" },
    { id: "future", en: "FUTURE", ja: "未来" },
  ];

  const state = {
    selectedCards: [],
    revealedCards: new Set(),
    isDrawing: false,
  };

  const elements = {
    intro: document.querySelector("#intro"),
    drawButton: document.querySelector("#draw-button"),
    reading: document.querySelector("#reading"),
    cardGrid: document.querySelector("#card-grid"),
    status: document.querySelector("#reading-status"),
    result: document.querySelector("#result"),
    resultList: document.querySelector("#result-list"),
    readingText: document.querySelector("#reading-text"),
    copyButton: document.querySelector("#copy-button"),
    copyStatus: document.querySelector("#copy-status"),
    redrawButton: document.querySelector("#redraw-button"),
  };

  let copyStatusTimer = null;

  function shuffleDeck(deck) {
    const shuffled = [...deck];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
  }

  function determineOrientation() {
    return Math.random() < 0.5;
  }

  function buildSelectedCards() {
    return shuffleDeck(window.TAROT_CARDS)
      .slice(0, 3)
      .map((card, index) => ({
        ...card,
        position: positions[index],
        isReversed: determineOrientation(),
      }));
  }

  function createCardImage(card, className) {
    const image = document.createElement("img");
    image.className = className;
    image.alt = card.isReversed ? `${card.name} reversed` : `${card.name} upright`;
    image.addEventListener("error", () => {
      image.hidden = true;
    });
    image.src = card.image;
    return image;
  }

  function createCardBack() {
    const back = document.createElement("span");
    back.className = "card-face card-face--back";
    back.setAttribute("aria-hidden", "true");

    const frame = document.createElement("span");
    frame.className = "card-back-frame";

    const monogram = document.createElement("span");
    monogram.className = "back-monogram";
    monogram.textContent = "CY";

    const image = document.createElement("img");
    image.className = "card-back-image";
    image.alt = "";
    image.addEventListener("error", () => {
      image.hidden = true;
    });
    image.src = "assets/cards/card-back.webp";

    frame.append(monogram, image);
    back.append(frame);
    return back;
  }

  function createCardFront(card) {
    const front = document.createElement("span");
    front.className = "card-face card-face--front";
    front.setAttribute("aria-hidden", "true");

    const artFrame = document.createElement("span");
    artFrame.className = `card-art-frame${card.isReversed ? " reversed" : ""}`;

    const placeholder = document.createElement("span");
    placeholder.className = "image-placeholder";

    const placeholderLabel = document.createElement("span");
    placeholderLabel.className = "placeholder-label";
    placeholderLabel.textContent = "CARD IMAGE · COMING SOON";

    const placeholderName = document.createElement("span");
    placeholderName.className = "placeholder-name";
    placeholderName.textContent = card.name;

    placeholder.append(placeholderLabel, placeholderName);
    artFrame.append(placeholder, createCardImage(card, "card-image"));
    front.append(artFrame);
    return front;
  }

  function createCardInfo(card) {
    const info = document.createElement("div");
    info.className = "card-info";
    info.hidden = true;

    const name = document.createElement("h3");
    name.textContent = card.name;

    const orientation = document.createElement("p");
    orientation.className = `orientation ${card.isReversed ? "reversed" : "upright"}`;
    orientation.textContent = card.isReversed ? "REVERSED · 逆位置" : "UPRIGHT · 正位置";

    const meaning = document.createElement("p");
    meaning.className = "meaning";
    meaning.textContent = card.isReversed ? card.reversed : card.upright;

    info.append(name, orientation, meaning);
    return info;
  }

  function renderCards() {
    elements.cardGrid.replaceChildren();

    state.selectedCards.forEach((card, index) => {
      const article = document.createElement("article");
      article.className = "reading-card";

      const positionLabel = document.createElement("div");
      positionLabel.className = "position-label";

      const positionEnglish = document.createElement("strong");
      positionEnglish.textContent = card.position.en;

      const positionJapanese = document.createElement("span");
      positionJapanese.textContent = card.position.ja;

      positionLabel.append(positionEnglish, positionJapanese);

      const cardButton = document.createElement("button");
      cardButton.type = "button";
      cardButton.className = "card";
      cardButton.disabled = true;
      cardButton.setAttribute("aria-pressed", "false");
      cardButton.setAttribute("aria-label", `${card.position.ja}のカードを開く`);

      const cardInner = document.createElement("span");
      cardInner.className = "card-inner";
      cardInner.append(createCardBack(), createCardFront(card));
      cardButton.append(cardInner);

      const info = createCardInfo(card);
      cardButton.addEventListener("click", () => flipCard(index, cardButton, info));

      article.append(positionLabel, cardButton, info);
      elements.cardGrid.append(article);
    });
  }

  function enableCardsAfterShuffle() {
    elements.cardGrid.classList.remove("is-shuffling");
    elements.cardGrid.querySelectorAll(".card").forEach((cardButton) => {
      cardButton.disabled = false;
    });
    state.isDrawing = false;
    elements.status.textContent = "カードを選び、1枚ずつ開いてください。";
  }

  function drawCards() {
    if (state.isDrawing) return;

    if (!Array.isArray(window.TAROT_CARDS) || window.TAROT_CARDS.length < 3) {
      elements.status.textContent = "カードデータを読み込めませんでした。";
      elements.reading.hidden = false;
      return;
    }

    state.isDrawing = true;
    state.revealedCards.clear();
    state.selectedCards = buildSelectedCards();

    elements.drawButton.disabled = true;
    elements.intro.hidden = true;
    elements.result.hidden = true;
    elements.resultList.replaceChildren();
    elements.reading.hidden = false;
    elements.status.textContent = "カードをシャッフルしています…";

    renderCards();
    elements.cardGrid.classList.add("is-shuffling");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(enableCardsAfterShuffle, reducedMotion ? 80 : 720);
  }

  function flipCard(index, cardButton, info) {
    if (state.isDrawing || state.revealedCards.has(index)) return;

    const card = state.selectedCards[index];
    state.revealedCards.add(index);
    cardButton.classList.add("is-revealed");
    cardButton.setAttribute("aria-pressed", "true");
    cardButton.setAttribute(
      "aria-label",
      `${card.position.ja}、${card.name}、${card.isReversed ? "逆位置" : "正位置"}、開封済み`,
    );
    cardButton.querySelector(".card-face--front").setAttribute("aria-hidden", "false");
    cardButton.disabled = true;
    info.hidden = false;

    const remaining = 3 - state.revealedCards.size;
    elements.status.textContent = remaining > 0
      ? `あと${remaining}枚です。`
      : "3枚すべてを開きました。";

    if (remaining === 0) {
      renderReading();
    }
  }

  function renderReading() {
    elements.resultList.replaceChildren();

    state.selectedCards.forEach((card) => {
      const item = document.createElement("article");
      item.className = "result-item";

      const positionEnglish = document.createElement("span");
      positionEnglish.className = "position-en";
      positionEnglish.textContent = card.position.en;

      const positionJapanese = document.createElement("span");
      positionJapanese.className = "position-ja";
      positionJapanese.textContent = card.position.ja;

      const name = document.createElement("h3");
      name.textContent = card.name;

      const orientation = document.createElement("p");
      orientation.className = `orientation ${card.isReversed ? "reversed" : "upright"}`;
      orientation.textContent = card.isReversed ? "REVERSED · 逆位置" : "UPRIGHT · 正位置";

      const meaning = document.createElement("p");
      meaning.className = "meaning";
      meaning.textContent = card.isReversed ? card.reversed : card.upright;

      item.append(positionEnglish, positionJapanese, name, orientation, meaning);
      elements.resultList.append(item);
    });

    elements.readingText.value = buildReadingText();
    clearCopyStatus();
    elements.result.hidden = false;
  }

  function buildReadingText() {
    const heading = ["CARY-YALE TAROT", "今回のリーディング"];
    const sections = state.selectedCards.map((card) => {
      const orientation = card.isReversed ? "逆位置 / REVERSED" : "正位置 / UPRIGHT";
      const meaning = card.isReversed ? card.reversed : card.upright;

      return [
        `${card.position.en} / ${card.position.ja}`,
        `カード：${card.name}`,
        `向き：${orientation}`,
        `意味：${meaning}`,
      ].join("\n");
    });

    return [...heading, "", ...sections.flatMap((section, index) =>
      index < sections.length - 1 ? [section, "", "---", ""] : [section]
    )].join("\n");
  }

  function clearCopyStatus() {
    if (copyStatusTimer !== null) {
      window.clearTimeout(copyStatusTimer);
      copyStatusTimer = null;
    }
    elements.copyButton.textContent = "結果をコピー";
    elements.copyStatus.textContent = "";
  }

  function showCopyStatus(message, succeeded) {
    clearCopyStatus();
    elements.copyButton.textContent = succeeded ? "コピーしました" : "コピーできませんでした";
    elements.copyStatus.textContent = message;
    copyStatusTimer = window.setTimeout(clearCopyStatus, 2400);
  }

  function fallbackCopyText() {
    const previousStart = elements.readingText.selectionStart;
    const previousEnd = elements.readingText.selectionEnd;

    elements.readingText.focus();
    elements.readingText.select();
    const copied = document.execCommand("copy");
    elements.readingText.setSelectionRange(previousStart, previousEnd);
    return copied;
  }

  async function copyReadingText() {
    const text = elements.readingText.value;
    if (!text) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else if (!fallbackCopyText()) {
        throw new Error("Copy command was rejected");
      }
      showCopyStatus("今回のリーディング結果をコピーしました。", true);
    } catch (error) {
      showCopyStatus("テキストを選択して手動でコピーしてください。", false);
    }
  }

  function resetReading() {
    elements.result.hidden = true;
    elements.readingText.value = "";
    clearCopyStatus();
    elements.status.textContent = "";
    drawCards();
  }

  elements.drawButton.addEventListener("click", drawCards);
  elements.copyButton.addEventListener("click", copyReadingText);
  elements.redrawButton.addEventListener("click", resetReading);
})();
