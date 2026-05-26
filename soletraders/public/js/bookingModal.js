const bookingModal = document.getElementById('bookingModal');

bookingModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;

    document.getElementById('modalClientName').textContent =
        button.getAttribute('data-client-name');

    document.getElementById('modalClientEmail').textContent =
        button.getAttribute('data-client-email');

    document.getElementById('modalServiceTitle').textContent =
        button.getAttribute('data-service-title');

    document.getElementById('modalDescription').textContent =
        button.getAttribute('data-description');

    // Cleaning up format of 2026-02-27T00:00:00.000Z
    const rawDate = button.getAttribute('data-requested-date');
    const cleanDate = rawDate.split('T')[0]; // This takes everything before the 'T' - Splits string into two pieces at the letter T, [0] selects the first piece
    document.getElementById('modalRequestedDate').textContent = cleanDate;
        button.getAttribute('data-requested-date');

    // Cleaning to HH:MM format instead of HH:MM:SS
    const rawTime = button.getAttribute('data-requested-time');
    const cleanTime = rawTime.substring(0, 5);
    document.getElementById('modalRequestedTime').textContent = cleanTime;
        button.getAttribute('data-requested-time');

    // Cleaning up format of 2026-02-27T00:00:00.000Z
    const rawCreatedAt = button.getAttribute('data-created-at');
    const cleanCreatedAt = rawCreatedAt.split('T')[0];
    document.getElementById('modalCreatedAt').textContent = cleanCreatedAt;
        button.getAttribute('data-created-at');
});