document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("discount-name");
  const descriptionInput = document.getElementById("discount-description");
  const startInput = document.getElementById("start-time");
  const endInput = document.getElementById("end-time");
  const hasEndCheckbox = document.getElementById("has-end-time");
  const typeSelect = document.getElementById("discount-type");
  const scopeSelect = document.getElementById("discount-scope");
  const valueInput = document.getElementById("discount-value");
  const unitSelect = document.getElementById("discount-unit");
  const limitInput = document.getElementById("discount-limit");
  const valueSuffix = document.getElementById("value-suffix");

  const summary = {
    title: document.getElementById("summary-title"),
    description: document.getElementById("summary-description"),
    type: document.getElementById("summary-type"),
    scope: document.getElementById("summary-scope"),
    value: document.getElementById("summary-value"),
    limit: document.getElementById("summary-limit"),
    time: document.getElementById("summary-time"),
  };

  const formatNumber = (value, isPercent = false) => {
    if (value === "" || value === null || Number.isNaN(Number(value))) {
      return isPercent ? "0%" : "0 ₫";
    }
    const numeric = Number(value);
    if (isPercent) {
      return `${numeric.toLocaleString("en-US")} %`;
    }
    return `${numeric.toLocaleString("en-US")} ₫`;
  };

  const formatDateTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const updateSummary = () => {
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const typeText = typeSelect.options[typeSelect.selectedIndex]?.text || "";
    const scopeText = scopeSelect.options[scopeSelect.selectedIndex]?.text || "";
    const unit = unitSelect.value;
    const value = valueInput.value;
    const limitValue = limitInput.value;

    summary.title.textContent = name || "Untitled";
    summary.description.textContent = description || "Enter a description to display here.";
    summary.type.textContent = typeText;
    summary.scope.textContent = `Applies to ${scopeText.toLowerCase()}`;

    const valueLabel = unit === "percent" ? formatNumber(value, true) : formatNumber(value);
    summary.value.textContent = `Discount ${valueLabel}`;

    if (limitValue) {
      const numericLimit = Number(limitValue);
      const limitLabel =
        unit === "percent"
          ? `${numericLimit.toLocaleString("en-US")} %`
          : `${numericLimit.toLocaleString("en-US")} ₫`;
      summary.limit.textContent = `Maximum limit ${limitLabel}`;
    } else {
      summary.limit.textContent = "No value limit";
    }

    const start = formatDateTime(startInput.value);
    const end = hasEndCheckbox.checked ? formatDateTime(endInput.value) : null;

    if (start && end) {
      summary.time.textContent = `Effective from ${start} - ${end}`;
    } else if (start && !hasEndCheckbox.checked) {
      summary.time.textContent = `Effective from ${start} (no end time limit)`;
    } else if (start) {
      summary.time.textContent = `Starts from ${start}`;
    } else {
      summary.time.textContent = "Time not set";
    }
  };

  const syncSuffix = () => {
    const unit = unitSelect.value;
    valueSuffix.textContent = unit === "percent" ? "%" : "₫";
    updateSummary();
  };

  hasEndCheckbox.addEventListener("change", () => {
    const enabled = hasEndCheckbox.checked;
    endInput.disabled = !enabled;
    if (!enabled) {
      endInput.value = "";
      endInput.setAttribute("aria-disabled", "true");
    } else {
      endInput.removeAttribute("aria-disabled");
    }
    updateSummary();
  });

  [nameInput, descriptionInput].forEach((node) => {
    node.addEventListener("input", updateSummary);
  });

  [startInput, endInput, typeSelect, scopeSelect, valueInput, limitInput].forEach((node) => {
    node.addEventListener("input", updateSummary);
    node.addEventListener("change", updateSummary);
  });

  unitSelect.addEventListener("change", syncSuffix);

  syncSuffix();
});
