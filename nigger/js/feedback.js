(() => {
  const form = document.querySelector('#feedbackForm');
  if (!form) return;

  const messageField = document.querySelector('#feedbackMessage');
  const status = document.querySelector('#feedbackStatus');
  const submit = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = messageField.value.trim();
    if (!message) {
      status.textContent = 'Напишите отзыв перед отправкой.';
      messageField.focus();
      return;
    }

    submit.disabled = true;
    status.textContent = 'Отправляем…';
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось отправить отзыв.');
      form.reset();
      status.textContent = result.message;
    } catch (error) {
      status.textContent = error.message || 'Не удалось связаться с сервером.';
    } finally {
      submit.disabled = false;
    }
  });
})();
