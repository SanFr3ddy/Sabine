const envelopeCard = document.querySelector<HTMLElement>("#envelope-card");
const envelopeToggle = document.querySelector<HTMLButtonElement>("#envelope-toggle");
const letterPaper = document.querySelector<HTMLElement>("#letter-paper");
const envelopeText = document.querySelector<HTMLElement>(".envelope-text");
const video = document.querySelector<HTMLVideoElement>("#sabine-video");
const photos = Array.from(document.querySelectorAll<HTMLElement>(".photo-card"));
const confettiCanvas = document.querySelector<HTMLCanvasElement>("#confetti-canvas");
const megaPartyBanner = document.querySelector<HTMLElement>("#mega-party-banner");

const selectedPhotos = new Set<string>();
let megaFiestaTriggered = false;

const perPhotoVideosRaw: string[] = [
  "assets/videos/Videos/#japan Japan is an island nation in the Pacific Ocean, renowned for its densely populated cities.mp4",
  "assets/videos/Videos/JUNGKOOK ON FYA🔥🔥🍙#bts #jungkook #explorepage #explore #kpop (2).mp4",
  "assets/videos/Videos/O peixe é um vertebrado aquático ectotérmico que respira predominantemente por brânquias e se lo.mp4",
  "assets/videos/Videos/日本利用压电瓷砖将脚步转化为电能。这些瓷砖捕捉来自你脚步的动能。当你行走时，你的重量和动作会对瓷砖产生压力。瓷砖会轻微弯曲，从而产生机械应力。瓷砖内部的压电材料将这种应力转化为电能。每一步都会.mp4",
  "assets/videos/Videos/𝒻ℴ𝓁𝓁ℴ𝓌 me ℴ𝓇 ℯ𝓁𝓈ℯ... 😩日本利用压电瓷砖将脚步转化为电能。这些瓷砖捕捉来自你脚步的动能。当你行走时，你的重量和动作会对瓷砖产生压力。瓷砖会轻微弯曲，从而产生.mp4",
  "assets/videos/Videos/🌽🕺.mp4",
];

const normalizeAssetUrl = (path: string): string => {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
};

const perPhotoVideos = perPhotoVideosRaw.map(normalizeAssetUrl).slice(0, photos.length);

const toggleEnvelope = (): void => {
  if (!envelopeCard || !envelopeToggle || !letterPaper || !envelopeText) return;

  const isOpen = envelopeCard.classList.toggle("open");
  letterPaper.hidden = !isOpen;
  envelopeToggle.setAttribute("aria-expanded", String(isOpen));
  envelopeText.textContent = isOpen ? "Cerrar sobre" : "Abrir sobre";
};

if (envelopeToggle) {
  envelopeToggle.addEventListener("click", toggleEnvelope);
}

const forceAudioOn = (): void => {
  if (!video) return;
  video.muted = false;
  video.defaultMuted = false;
  if (video.volume === 0) {
    video.volume = 1;
  }
};

if (video) {
  video.removeAttribute("muted");
  forceAudioOn();
  video.addEventListener("play", forceAudioOn);
  video.addEventListener("volumechange", () => {
    if (video.muted) {
      video.muted = false;
    }
    if (video.volume === 0) {
      video.volume = 1;
    }
  });
  window.addEventListener("pointerdown", forceAudioOn, { once: true });
}

type ConfettiMode = "mini" | "mega";

interface ConfettiOptions {
  mode?: ConfettiMode;
  sourceX?: number;
  sourceY?: number;
}

const triggerConfetti = ({ mode = "mini", sourceX, sourceY }: ConfettiOptions = {}): void => {
  if (!confettiCanvas) return;

  const ctx = confettiCanvas.getContext("2d");
  if (!ctx) return;

  const resizeCanvas = (): void => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  };

  resizeCanvas();

  const colors = ["#2ec4ff", "#61e8ff", "#fef08a", "#ffffff", "#7dd3fc"];
  const totalPieces = mode === "mega" ? 900 : 110;
  const maxFrames = mode === "mega" ? 380 : 120;
  const baseX = sourceX ?? confettiCanvas.width / 2;
  const baseY = sourceY ?? confettiCanvas.height * 0.2;
  const spread = mode === "mega" ? confettiCanvas.width : 150;

  const pieces = Array.from({ length: totalPieces }, () => ({
    x:
      mode === "mega"
        ? Math.random() * confettiCanvas.width
        : baseX + (-spread / 2 + Math.random() * spread),
    y:
      mode === "mega"
        ? -20 - Math.random() * confettiCanvas.height * 0.3
        : baseY - 40 + Math.random() * 50,
    w: 5 + Math.random() * 7,
    h: 7 + Math.random() * 9,
    speedY: mode === "mega" ? 2 + Math.random() * 6 : 1.5 + Math.random() * 3.8,
    speedX: -3 + Math.random() * 6,
    rotation: Math.random() * Math.PI,
    spin: -0.2 + Math.random() * 0.4,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  let frame = 0;

  const animate = (): void => {
    frame += 1;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    pieces.forEach((piece) => {
      piece.x += piece.speedX;
      piece.y += piece.speedY;
      piece.rotation += piece.spin;

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      ctx.restore();

      if (piece.y > confettiCanvas.height + 20) {
        if (mode === "mega") {
          piece.y = -20;
        }
      }
    });

    if (frame < maxFrames) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  };

  animate();
};

const playVideoInsidePhoto = (photo: HTMLElement, videoSrc: string): void => {
  if (!videoSrc || photo.classList.contains("playing")) return;

  const previous = photo.querySelector<HTMLVideoElement>(".photo-overlay-video");
  if (previous) {
    previous.remove();
  }

  const overlayVideo = document.createElement("video");
  overlayVideo.className = "photo-overlay-video";
  overlayVideo.src = videoSrc;
  overlayVideo.preload = "auto";
  overlayVideo.playsInline = true;
  overlayVideo.muted = false;
  overlayVideo.volume = 1;

  const cleanUp = (): void => {
    overlayVideo.pause();
    overlayVideo.remove();
    photo.classList.remove("playing");
  };

  overlayVideo.addEventListener("ended", cleanUp, { once: true });
  overlayVideo.addEventListener("error", cleanUp, { once: true });

  photo.classList.add("playing");
  photo.appendChild(overlayVideo);

  void overlayVideo.play().catch(() => {
    cleanUp();
  });
};

const startMegaFiesta = (): void => {
  if (megaFiestaTriggered) return;

  megaFiestaTriggered = true;
  document.body.classList.add("mega-fiesta");

  if (megaPartyBanner) {
    megaPartyBanner.hidden = false;
    megaPartyBanner.classList.add("show");
  }

  triggerConfetti({ mode: "mega" });

  window.setTimeout(() => {
    document.body.classList.remove("mega-fiesta");
    if (megaPartyBanner) {
      megaPartyBanner.classList.remove("show");
      megaPartyBanner.hidden = true;
    }
  }, 5600);
};

const onPhotoPress = (photo: HTMLElement, index: number): void => {
  photo.classList.add("press-pop");

  photo.addEventListener(
    "animationend",
    () => {
      photo.classList.remove("press-pop");
    },
    { once: true }
  );

  const rect = photo.getBoundingClientRect();
  triggerConfetti({
    mode: "mini",
    sourceX: rect.left + rect.width / 2,
    sourceY: rect.top + rect.height / 2,
  });

  const photoId = photo.dataset.photo ?? String(index + 1);
  const wasSelected = selectedPhotos.has(photoId);

  if (!wasSelected) {
    selectedPhotos.add(photoId);
    photo.classList.add("pressed");

    const videoSrc = perPhotoVideos[index];
    if (videoSrc) {
      playVideoInsidePhoto(photo, videoSrc);
    }
  }

  if (selectedPhotos.size === photos.length) {
    startMegaFiesta();
  }
};

photos.forEach((photo, index) => {
  photo.addEventListener("click", () => onPhotoPress(photo, index));
  photo.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPhotoPress(photo, index);
    }
  });
});
