const track = document.getElementById('testimonialTrack');
const slideInterval = 5000; // หยุดรอ 5 วินาที

function slideNext() {
    const firstCard = track.firstElementChild;
    track.style.transition = 'transform 0.5s ease-in-out';
    track.style.transform = `translateX(-${firstCard.offsetWidth + 20}px)`; // 20 คือค่า gap

    setTimeout(() => {
        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';
        track.appendChild(firstCard); // ย้ายการ์ดแรกไปไว้ท้ายสุด
    }, 500); // ต้องตรงกับเวลา transition
}

setInterval(slideNext, slideInterval);