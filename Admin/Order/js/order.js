document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const toggles = Array.from(document.querySelectorAll(".row-toggle"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
    });
  });

  toggles.forEach((toggle) => {
    const row = toggle.closest(".order-row");
    if (!row) return;

    const detailRow = row.nextElementSibling;
    const hasDetails = detailRow && detailRow.classList.contains("order-details");

    if (!hasDetails) {
      toggle.dataset.expanded = "false";
      toggle.textContent = "▸";
      toggle.classList.add("is-disabled");
      row.classList.remove("is-open");
      return;
    }

    const syncState = (expanded) => {
      row.classList.toggle("is-open", expanded);
      toggle.dataset.expanded = String(expanded);
      toggle.textContent = expanded ? "▾" : "▸";
      if (detailRow && detailRow.classList.contains("order-details")) {
        detailRow.classList.toggle("is-open", expanded);
      }
    };

    // Initialize state based on markup
    const initiallyExpanded = toggle.dataset.expanded === "true" || row.classList.contains("is-open");
    syncState(initiallyExpanded);

    toggle.addEventListener("click", () => {
      const expanded = toggle.dataset.expanded === "true";
      syncState(!expanded);
    });
  });

  const body = document.body;
  let activeModal = null;

  const getOrderId = (trigger) => {
    if (trigger.dataset.order) {
      return trigger.dataset.order;
    }

    const detailRow = trigger.closest(".order-details");
    const orderRow = detailRow ? detailRow.previousElementSibling : trigger.closest(".order-row");
    const orderLink = orderRow ? orderRow.querySelector("td:nth-child(2) a") : null;

    return orderLink ? orderLink.textContent.trim() : "";
  };

  const setOrderPlaceholder = (modal, orderId) => {
    if (!modal) return;
    modal.querySelectorAll("[data-order-placeholder]").forEach((node) => {
      if (!node.dataset.defaultOrder) {
        node.dataset.defaultOrder = node.textContent.trim();
      }
      node.textContent = orderId || node.dataset.defaultOrder;
    });
  };

  const openModal = (modal, trigger) => {
    if (!modal) return;
    const orderId = trigger ? getOrderId(trigger) : "";
    setOrderPlaceholder(modal, orderId);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
    activeModal = modal;
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (activeModal === modal) {
      activeModal = null;
    }
    if (!document.querySelector(".modal.is-open")) {
      body.classList.remove("modal-open");
    }
  };

  const modalTriggers = document.querySelectorAll("[data-modal-target]");

  const cancelModal = document.getElementById("modal-cancel");
  const cancelReason = cancelModal ? cancelModal.querySelector("#cancel-reason") : null;
  const cancelNote = cancelModal ? cancelModal.querySelector("#cancel-note") : null;
  const cancelConfirmButton = cancelModal
    ? cancelModal.querySelector('[data-modal-confirm="cancel"]')
    : null;

  const updateCancelButtonState = () => {
    if (!cancelConfirmButton || !cancelReason || !cancelNote) return;
    const reasonSelected = cancelReason.value.trim().length > 0;
    const noteProvided = cancelNote.value.trim().length > 0;
    cancelConfirmButton.disabled = !(reasonSelected && noteProvided);
  };

  if (cancelReason && cancelNote) {
    cancelReason.addEventListener("change", updateCancelButtonState);
    cancelReason.addEventListener("input", updateCancelButtonState);
  }

  if (cancelNote) {
    cancelNote.addEventListener("input", updateCancelButtonState);
  }

  if (cancelConfirmButton) {
    cancelConfirmButton.addEventListener("click", () => {
      updateCancelButtonState();
      if (cancelConfirmButton.disabled) return;
      closeModal(cancelModal);
    });
  }

  updateCancelButtonState();

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const modalId = trigger.dataset.modalTarget;
      const modal = document.getElementById(modalId);
      if (modalId === "modal-cancel") {
        updateCancelButtonState();
      }
      openModal(modal, trigger);
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach((closeButton) => {
    closeButton.addEventListener("click", () => {
      closeModal(closeButton.closest(".modal"));
    });
  });

  document.querySelectorAll(".modal__overlay").forEach((overlay) => {
    overlay.addEventListener("click", () => {
      closeModal(overlay.closest(".modal"));
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeModal) {
      closeModal(activeModal);
    }
  });
});
