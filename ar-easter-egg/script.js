/**
 * 《怪咖機器人阿鏘》AR 彩蛋 - 主要互動腳本
 *
 * 功能特色：
 * 1. MindAR 影像追蹤整合，完全獨立運作，零干擾主專案
 * 2. 兒童友善引導介面、相機權限引導、行動端音訊解鎖政策支援
 * 3. 4～6 秒「阿鏘誕生」精緻動畫時間軸：
 *    - 0.0s: 電線火花閃爍 +「滋滋」機械電氣聲
 *    - 0.8s: 胸口儀表浮現金色光暈 + 蓄能
 *    - 1.4s: 天線晃動
 *    - 1.8s: 阿鏘從插畫位置放大彈跳躍出 + 身體晃動
 *    - 2.6s: 熱情揮手 + 對白泡泡浮現「你好呀！我就是阿鏘！」+ 溫暖叮聲
 *    - 4.2s: 可愛爆米花向外爆開 +「鏘——！」電鍋彈跳聲與爆米花聲
 *    - 5.5s: 進入溫柔呼吸微動，提供「再看一次」按鈕重播
 * 4. 完整的相機生命週期管理：離開/返回時完全停止相機串流釋放硬體資源
 */

(function () {
  'use strict';

  // --- DOM Elements ---
  const modalWelcome = document.getElementById('modal-welcome');
  const modalPreview = document.getElementById('modal-preview');
  const modalError = document.getElementById('modal-error');

  const btnStartAr = document.getElementById('btn-start-ar');
  const btnBack = document.getElementById('btn-back');
  const btnErrorBack = document.getElementById('btn-error-back');
  const btnRetry = document.getElementById('btn-retry');
  const btnPreviewToggle = document.getElementById('btn-preview-toggle');
  const btnClosePreview = document.getElementById('btn-close-preview');
  const btnAudioToggle = document.getElementById('btn-audio-toggle');
  const audioIcon = document.getElementById('audio-icon');
  const btnReplay = document.getElementById('btn-replay');

  const scanningViewfinder = document.getElementById('scanning-viewfinder');
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');

  // --- AR Entities ---
  const sceneEl = document.getElementById('ar-scene');
  const arTarget = document.getElementById('ar-target');
  const elSparkle = document.getElementById('ar-sparkle');
  const elBookGlow = document.getElementById('ar-book-glow');
  const elBookAntennaPivot = document.getElementById('ar-book-antenna-pivot');
  const elAchang = document.getElementById('ar-achang');
  const elAchangBody = document.getElementById('ar-achang-body');
  const elAntennaPivot = document.getElementById('ar-antenna-pivot');
  const elAchangAntenna = document.getElementById('ar-achang-antenna');
  const elGlow = document.getElementById('ar-glow');
  const elBubble = document.getElementById('ar-bubble');
  const elPopcornGroup = document.getElementById('ar-popcorn-group');
  const popcornParticles = [
    document.getElementById('popcorn-p1'),
    document.getElementById('popcorn-p2'),
    document.getElementById('popcorn-p3'),
    document.getElementById('popcorn-p4'),
    document.getElementById('popcorn-p5'),
  ];

  // --- Audio Elements ---
  const audioElectric = document.getElementById('audio-electric');
  const audioChang = document.getElementById('audio-chang');
  const audioPopcorn = document.getElementById('audio-popcorn');
  const audioChime = document.getElementById('audio-chime');

  const audioList = [audioElectric, audioChang, audioPopcorn, audioChime];

  // --- State Variables ---
  let isMuted = false;
  let isArStarted = false;
  let isTargetVisible = false;
  let isAnimating = false;
  let animationCompleted = false;
  let animationTimeouts = [];
  let idleAnimFrame = null;
  let idleTime = 0;

  // --- Audio Helpers ---
  function unlockAudioContext() {
    audioList.forEach((audio) => {
      if (!audio) return;
      audio.volume = isMuted ? 0 : 1;
      // Pre-warm audio element within user click gesture
      audio.load();
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
          })
          .catch(() => {
            // Ignore pre-warm pause failures
          });
      }
    });
  }

  function playSound(audioEl) {
    if (isMuted || !audioEl) return;
    audioEl.muted = false;
    audioEl.volume = 1;
    audioEl.currentTime = 0;
    const p = audioEl.play();
    if (p !== undefined) {
      p.catch((err) => console.warn('Audio play notice:', err.message));
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    audioIcon.innerText = isMuted ? '🔇' : '🔊';
    btnAudioToggle.setAttribute('aria-pressed', isMuted ? 'true' : 'false');
    btnAudioToggle.setAttribute('title', isMuted ? '點擊開啟音效' : '點擊關閉音效');
    btnAudioToggle.setAttribute('aria-label', isMuted ? '音效已關閉（點擊開啟）' : '音效已開啟（點擊關閉）');

    audioList.forEach((a) => {
      if (a) {
        a.muted = isMuted;
        a.volume = isMuted ? 0 : 1;
        if (isMuted) {
          try {
            a.pause();
            a.currentTime = 0;
          } catch (e) {}
        }
      }
    });
  }

  // --- Camera Lifecycle & Navigation ---
  function stopAllMediaStreams() {
    // 1. Stop MindAR tracking system
    if (sceneEl && sceneEl.systems && sceneEl.systems['mindar-image-system']) {
      const arSystem = sceneEl.systems['mindar-image-system'];
      try {
        if (typeof arSystem.stop === 'function') arSystem.stop();
      } catch (e) {
        console.warn('Error stopping AR system:', e);
      }
      if (arSystem.video && arSystem.video.srcObject) {
        try {
          arSystem.video.srcObject.getTracks().forEach((track) => track.stop());
        } catch (e) {}
      }
    }

    // 2. Stop all video elements in DOM
    document.querySelectorAll('video').forEach((v) => {
      if (v.srcObject) {
        try {
          v.srcObject.getTracks().forEach((t) => t.stop());
          v.srcObject = null;
        } catch (e) {}
      }
    });

    cancelIdleAnimation();
    clearAnimationSequence();
  }

  function returnToStorybook() {
    stopAllMediaStreams();
    // Smooth transition back to the main interactive storybook
    window.location.href = '../index.html';
  }

  // Bind unload events to ensure camera releases immediately
  window.addEventListener('beforeunload', stopAllMediaStreams);
  window.addEventListener('pagehide', stopAllMediaStreams);

  // --- Start AR Experience ---
  async function startArExperience() {
    modalWelcome.classList.add('hidden');
    unlockAudioContext();

    try {
      statusText.innerText = '正在啟動相機...';

      // Check browser getUserMedia support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的瀏覽器不支援相機 API，請使用 Chrome、Safari 或 Edge 開啟。');
      }

      // Check secure context (HTTPS or localhost)
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!window.isSecureContext && !isLocalhost) {
        throw new Error('相機功能需要 HTTPS 安全連線環境，請透過 HTTPS 網址開啟。');
      }

      // Ensure A-Frame scene is loaded
      if (!sceneEl.hasLoaded) {
        await new Promise((resolve) => sceneEl.addEventListener('loaded', resolve, { once: true }));
      }

      const arSystem = sceneEl.systems['mindar-image-system'];
      if (!arSystem) {
        throw new Error('MindAR 追蹤系統初始化失敗，請重新整理頁面。');
      }

      await arSystem.start();
      isArStarted = true;

      scanningViewfinder.classList.add('active');
      statusPill.className = 'searching';
      statusText.innerText = '請對準故事頁數 4/11「小宇接電線」插畫...';
      console.log('[AR] MindAR tracking started successfully.');
    } catch (err) {
      console.error('[AR Start Error]', err);
      showErrorModal(err.message || '無法啟動相機，請確認瀏覽器相機授權。');
    }
  }

  function showErrorModal(message) {
    document.getElementById('error-message').innerText = message;
    modalError.classList.remove('hidden');
  }

  // --- Three.js & A-Frame Material / Layer Order Setup ---
  function configureMaterials() {
    const layerConfigs = [
      { el: elSparkle, order: 2 },
      { el: elAchangBody, order: 3 },
      { el: elBookAntennaPivot, order: 4 },
      { el: elAntennaPivot, order: 4 },
      { el: elAchangAntenna, order: 4 },
      { el: elBookGlow, order: 5 },
      { el: elGlow, order: 5 },
      { el: elPopcornGroup, order: 6 },
      { el: elBubble, order: 7 },
    ];

    layerConfigs.forEach(({ el, order }) => {
      if (!el) return;
      const apply = () => {
        if (!el.object3D) return;
        el.object3D.renderOrder = order;
        el.object3D.traverse((node) => {
          if (node.isMesh && node.material) {
            node.renderOrder = order;
            node.material.transparent = true;
            node.material.depthWrite = false;
            node.material.depthTest = true;
            node.material.needsUpdate = true;
          }
        });
      };
      if (el.hasLoaded) {
        apply();
      } else {
        el.addEventListener('loaded', apply);
      }
      apply();
    });
  }

  // --- 6-Second "A-Chang Birth" Animation Timeline ---
  function clearAnimationSequence() {
    animationTimeouts.forEach((id) => clearTimeout(id));
    animationTimeouts = [];
    isAnimating = false;
  }

  function resetEntityStates() {
    if (elSparkle) {
      elSparkle.setAttribute('visible', 'false');
      elSparkle.setAttribute('scale', '1 1 1');
      elSparkle.setAttribute('position', '0.04 -0.07 0.02');
    }
    if (elBookGlow) {
      elBookGlow.setAttribute('visible', 'false');
      elBookGlow.setAttribute('scale', '0.4 0.4 1');
      elBookGlow.setAttribute('position', '0.195 -0.043 0.025');
    }
    if (elBookAntennaPivot) {
      elBookAntennaPivot.setAttribute('visible', 'false');
      elBookAntennaPivot.setAttribute('rotation', '0 0 0');
    }
    if (elAchang) {
      elAchang.setAttribute('visible', 'false');
      elAchang.setAttribute('position', '0.22 -0.03 0.01');
      elAchang.setAttribute('scale', '0.01 0.01 0.01');
      elAchang.setAttribute('rotation', '0 0 0');
    }
    if (elAntennaPivot) {
      elAntennaPivot.setAttribute('rotation', '0 0 0');
    }
    if (elGlow) {
      elGlow.setAttribute('visible', 'false');
      elGlow.setAttribute('scale', '1 1 1');
    }
    if (elBubble) {
      elBubble.setAttribute('visible', 'false');
      elBubble.setAttribute('scale', '0.01 0.01 0.01');
      elBubble.setAttribute('position', '0.24 0.23 0.14');
    }
    if (elPopcornGroup) {
      elPopcornGroup.setAttribute('visible', 'false');
      popcornParticles.forEach((p) => {
        if (!p) return;
        p.setAttribute('position', '0 0 0');
        p.setAttribute('scale', '1 1 1');
        p.setAttribute('rotation', '0 0 0');
        if (p.object3D) {
          p.object3D.position.set(0, 0, 0);
          p.object3D.scale.set(1, 1, 1);
          p.object3D.rotation.set(0, 0, 0);
          p.object3D.traverse((child) => {
            if (child.isMesh && child.material) {
              child.material.opacity = 1.0;
            }
          });
        }
      });
    }
  }

  function playBirthAnimation() {
    clearAnimationSequence();
    cancelIdleAnimation();
    resetEntityStates();
    configureMaterials();

    isAnimating = true;
    animationCompleted = false;
    btnReplay.classList.add('hidden');

    console.log('[AR] Starting A-Chang Birth animation sequence...');

    // ------------------------------------------------------------------
    // Phase 1 (0.0s - 0.8s): Wire sparks flash + Electric mechanical sound
    // ------------------------------------------------------------------
    playSound(audioElectric);
    if (elSparkle) {
      elSparkle.setAttribute('visible', 'true');
      let sparkCount = 0;
      const sparkInterval = setInterval(() => {
        sparkCount++;
        const s = 0.8 + Math.random() * 0.5;
        const rot = (Math.random() - 0.5) * 40;
        elSparkle.setAttribute('scale', `${s} ${s} 1`);
        elSparkle.setAttribute('rotation', `0 0 ${rot}`);
        if (sparkCount > 7) clearInterval(sparkInterval);
      }, 90);
    }

    // ------------------------------------------------------------------
    // Phase 2 (0.8s - 1.4s): Chest Gauge lights up on illustration with golden glow
    // ------------------------------------------------------------------
    const tGlow = setTimeout(() => {
      if (!isAnimating) return;
      if (elSparkle) elSparkle.setAttribute('visible', 'false');

      if (elBookGlow) {
        elBookGlow.setAttribute('visible', 'true');
        // Softly animate golden glow scale from 0.4 up to 1.15
        animateScale(elBookGlow, 0.4, 1.15, 380, easeOutBack, () => {
          // Subtle pulse
          animateScale(elBookGlow, 1.15, 1.02, 220, easeInOutQuad);
        });
      }
    }, 800);
    animationTimeouts.push(tGlow);

    // ------------------------------------------------------------------
    // Phase 3 (1.4s - 1.8s): Antenna vibration & energy build-up
    // ------------------------------------------------------------------
    const tAntenna = setTimeout(() => {
      if (!isAnimating) return;
      if (elBookGlow) {
        // Second energy pulse
        animateScale(elBookGlow, 1.02, 1.25, 250, easeOutBack);
      }

      if (elBookAntennaPivot) {
        elBookAntennaPivot.setAttribute('visible', 'true');
        // Playful antenna wobble (+/- 10 deg)
        animateAntennaWobble(elBookAntennaPivot, 10, 400);
      }
    }, 1400);
    animationTimeouts.push(tAntenna);

    // ------------------------------------------------------------------
    // Phase 4 (1.8s - 2.6s): A-Chang leaps out from illustration with elastic bounce!
    // ------------------------------------------------------------------
    const tLeap = setTimeout(() => {
      if (!isAnimating) return;
      // Seamlessly hand off from book illustration to 3D Achang
      if (elBookGlow) elBookGlow.setAttribute('visible', 'false');
      if (elBookAntennaPivot) elBookAntennaPivot.setAttribute('visible', 'false');

      if (elAchang) {
        elAchang.setAttribute('visible', 'true');

        // Chest glow on Achang's body is active in foreground
        if (elGlow) {
          elGlow.setAttribute('visible', 'true');
          animateScale(elGlow, 0.8, 1.15, 400, easeOutBack);
        }

        // Antenna on Achang's head wobbles with leap impact
        if (elAntennaPivot) {
          animateAntennaWobble(elAntennaPivot, 12, 600);
        }

        // Leap from background (z: 0.01) forward to (z: 0.08)
        animateVector3(
          (pos) => elAchang.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`),
          { x: 0.22, y: -0.03, z: 0.01 },
          { x: 0.22, y: 0.02, z: 0.08 },
          700,
          easeOutElastic
        );

        animateScale(elAchang, 0.05, 1.08, 550, easeOutBack, () => {
          animateScale(elAchang, 1.08, 1.0, 200, easeInOutQuad);
        });

        // Playful body rotation wobble
        animateRotationWobble(elAchang, 8, 600);
      }
    }, 1800);
    animationTimeouts.push(tLeap);

    // ------------------------------------------------------------------
    // Phase 5 (2.6s - 4.2s): Waving hand + Dialogue bubble pops in stably + Chime
    // ------------------------------------------------------------------
    const tBubble = setTimeout(() => {
      if (!isAnimating) return;
      playSound(audioChime);

      // Stable speech bubble in foreground (Z = 0.14)
      if (elBubble) {
        elBubble.setAttribute('visible', 'true');
        animateScale(elBubble, 0.05, 1.12, 320, easeOutBack, () => {
          animateScale(elBubble, 1.12, 1.0, 180, easeInOutQuad);
        });
      }

      // Friendly wave gesture wobble
      if (elAchang) {
        animateRotationWobble(elAchang, 6, 800);
      }
      if (elAntennaPivot) {
        animateAntennaWobble(elAntennaPivot, 6, 700);
      }
    }, 2600);
    animationTimeouts.push(tBubble);

    // ------------------------------------------------------------------
    // Phase 6 (4.2s - 5.6s): Multi-Popcorn Burst + "鏘——！" + Explosion sound
    // ------------------------------------------------------------------
    const tPopcorn = setTimeout(() => {
      if (!isAnimating) return;
      playSound(audioChang);
      playSound(audioPopcorn);

      // Multi-Popcorn burst flight physics
      burstPopcornParticles();

      // Celebratory bounce for A-Chang
      if (elAchang) {
        animateScale(elAchang, 1.0, 1.12, 200, easeOutBack, () => {
          animateScale(elAchang, 1.12, 1.0, 200, easeInOutQuad);
        });
      }
      if (elAntennaPivot) {
        animateAntennaWobble(elAntennaPivot, 10, 500);
      }
    }, 4200);
    animationTimeouts.push(tPopcorn);

    // ------------------------------------------------------------------
    // Phase 7 (5.5s+): Complete! Enter smooth idle breathing & enable replay
    // ------------------------------------------------------------------
    const tFinish = setTimeout(() => {
      if (!isAnimating) return;
      isAnimating = false;
      animationCompleted = true;

      btnReplay.classList.remove('hidden');
      statusText.innerText = '🎉 阿鏘誕生完成！隨時可返回繪本';
      startIdleBreathing();
      console.log('[AR] Animation completed. Idle breathing loop active.');
    }, 5500);
    animationTimeouts.push(tFinish);
  }

  // --- Multi-Particle Popcorn Burst Animation ---
  function burstPopcornParticles() {
    if (!elPopcornGroup) return;
    elPopcornGroup.setAttribute('visible', 'true');

    // 5 Particles flying in different directions with individual velocities and rotations
    const configs = [
      { el: popcornParticles[0], vx: -0.04, vy: 0.22, vz: 0.03, rotSpeed: 140, baseScale: 1.0 },
      { el: popcornParticles[1], vx: -0.16, vy: 0.15, vz: 0.02, rotSpeed: -220, baseScale: 0.95 },
      { el: popcornParticles[2], vx: 0.15, vy: 0.18, vz: 0.04, rotSpeed: 250, baseScale: 0.95 },
      { el: popcornParticles[3], vx: -0.11, vy: 0.06, vz: 0.05, rotSpeed: -180, baseScale: 0.85 },
      { el: popcornParticles[4], vx: 0.17, vy: 0.08, vz: 0.04, rotSpeed: 200, baseScale: 0.85 },
    ];

    const startTime = performance.now();
    const duration = 1400; // 1.4s duration (lasts until ~5.6s)
    const gravity = 0.16;

    function stepPopcorn(now) {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(1, (now - startTime) / duration);

      configs.forEach((cfg) => {
        if (!cfg.el || !cfg.el.object3D) return;
        const x = cfg.vx * elapsed;
        const y = cfg.vy * elapsed - 0.5 * gravity * elapsed * elapsed;
        const z = cfg.vz * elapsed;
        cfg.el.object3D.position.set(x, y, z);

        const rotZ = (cfg.rotSpeed * elapsed * Math.PI) / 180;
        cfg.el.object3D.rotation.z = rotZ;

        // Scale pop-in
        const scaleProgress = Math.min(1, elapsed / 0.25);
        const s = cfg.baseScale * (0.3 + 0.7 * easeOutBack(scaleProgress));
        cfg.el.object3D.scale.set(s, s, s);

        // Smooth opacity fade out starting at 0.9s
        let opacity = 1.0;
        if (elapsed > 0.9) {
          opacity = Math.max(0, 1.0 - (elapsed - 0.9) / 0.5);
        }
        cfg.el.object3D.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.opacity = opacity;
          }
        });
      });

      if (progress < 1) {
        requestAnimationFrame(stepPopcorn);
      } else {
        if (elPopcornGroup) elPopcornGroup.setAttribute('visible', 'false');
      }
    }

    requestAnimationFrame(stepPopcorn);
  }

  // --- Smooth Idle Breathing Animation ---
  function startIdleBreathing() {
    cancelIdleAnimation();
    let startTimestamp = null;

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = (timestamp - startTimestamp) / 1000;

      if (elAchang && elAchang.object3D && elAchang.getAttribute('visible') === 'true') {
        // Gentle breathing scale variation (+/- 2.0%)
        const breath = 1.0 + Math.sin(elapsed * 2.2) * 0.02;
        elAchang.object3D.scale.set(breath, breath, 1);

        // Subtle body swaying (+/- 1.0 deg)
        const sway = Math.sin(elapsed * 1.6) * (1.0 * Math.PI / 180);
        elAchang.object3D.rotation.z = sway;
      }

      if (elAntennaPivot && elAntennaPivot.object3D) {
        // Subtle antenna response swaying (+/- 1.8 deg)
        const antSway = Math.sin(elapsed * 2.0 + 0.5) * (1.8 * Math.PI / 180);
        elAntennaPivot.object3D.rotation.z = antSway;
      }

      if (elGlow && elGlow.object3D && elGlow.getAttribute('visible') === 'true') {
        // Gentle warm chest glow pulsing (+/- 6%)
        const pulse = 1.0 + Math.sin(elapsed * 2.8) * 0.06;
        elGlow.object3D.scale.set(pulse, pulse, 1);
      }

      if (elBubble && elBubble.object3D && elBubble.getAttribute('visible') === 'true') {
        // Subtle gentle floating y position (+/- 0.005) directly updated on Three.js (no attribute thrashing)
        elBubble.object3D.position.y = 0.23 + Math.sin(elapsed * 2.2) * 0.005;
      }

      idleAnimFrame = requestAnimationFrame(step);
    }

    idleAnimFrame = requestAnimationFrame(step);
  }

  function cancelIdleAnimation() {
    if (idleAnimFrame) {
      cancelAnimationFrame(idleAnimFrame);
      idleAnimFrame = null;
    }
  }

  // --- Animation Utility Functions (Pure JS Easing) ---
  function animateScale(el, fromS, toS, duration, easing = easeOutQuad, onComplete = null) {
    const startTime = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - startTime) / duration);
      const val = fromS + (toS - fromS) * easing(p);
      el.setAttribute('scale', `${val} ${val} 1`);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else if (onComplete) {
        onComplete();
      }
    }
    requestAnimationFrame(tick);
  }

  function animateVector3(setter, fromV, toV, duration, easing = easeOutQuad, onComplete = null) {
    const startTime = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - startTime) / duration);
      const ep = easing(p);
      const cur = {
        x: fromV.x + (toV.x - fromV.x) * ep,
        y: fromV.y + (toV.y - fromV.y) * ep,
        z: fromV.z + (toV.z - fromV.z) * ep,
      };
      setter(cur);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else if (onComplete) {
        onComplete();
      }
    }
    requestAnimationFrame(tick);
  }

  function animateRotationWobble(el, maxDeg, duration) {
    const startTime = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - startTime) / duration);
      // Damped sine wobble
      const deg = Math.sin(p * Math.PI * 4) * maxDeg * (1 - p);
      el.setAttribute('rotation', `0 0 ${deg}`);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.setAttribute('rotation', '0 0 0');
      }
    }
    requestAnimationFrame(tick);
  }

  function animateAntennaWobble(el, maxDeg, duration) {
    if (!el) return;
    const startTime = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - startTime) / duration);
      // Damped sine wobble: 3 playful oscillations
      const deg = Math.sin(p * Math.PI * 6) * maxDeg * (1 - p);
      el.setAttribute('rotation', `0 0 ${deg}`);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.setAttribute('rotation', '0 0 0');
      }
    }
    requestAnimationFrame(tick);
  }

  // --- Easing Curves ---
  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  // --- MindAR Target Events Binding (With Tracking Loss Debounce) ---
  let targetLostTimer = null;

  function setupTargetEvents() {
    if (!arTarget) return;

    arTarget.addEventListener('targetFound', () => {
      console.log('[AR Event] Target Found!');
      if (targetLostTimer) {
        clearTimeout(targetLostTimer);
        targetLostTimer = null;
      }
      isTargetVisible = true;
      scanningViewfinder.classList.remove('active');
      statusPill.className = 'found';
      statusText.innerText = '🎉 發現阿鏘！';

      if (!animationCompleted && !isAnimating) {
        playBirthAnimation();
      } else if (animationCompleted) {
        startIdleBreathing();
      }
    });

    arTarget.addEventListener('targetLost', () => {
      console.log('[AR Event] Target Lost (Buffering 350ms)...');
      if (targetLostTimer) clearTimeout(targetLostTimer);

      targetLostTimer = setTimeout(() => {
        console.log('[AR Event] Target Lost confirmed.');
        isTargetVisible = false;
        scanningViewfinder.classList.add('active');
        statusPill.className = 'searching';

        if (animationCompleted) {
          statusText.innerText = '🔍 鏡頭暫時移開，請重新對準故事頁數 4/11「小宇接電線」';
        } else {
          statusText.innerText = '正在尋找阿鏘...';
        }
      }, 350);
    });
  }

  // --- Event Listeners Setup ---
  function init() {
    // 1. Welcome Modal & Start AR
    btnStartAr.addEventListener('click', startArExperience);

    // 2. Navigation / Exit
    btnBack.addEventListener('click', returnToStorybook);
    btnErrorBack.addEventListener('click', returnToStorybook);

    // 3. Audio Mute Toggle
    btnAudioToggle.addEventListener('click', toggleMute);

    // 4. Target Preview Modal
    btnPreviewToggle.addEventListener('click', () => {
      modalPreview.classList.remove('hidden');
    });
    btnClosePreview.addEventListener('click', () => {
      modalPreview.classList.add('hidden');
    });

    // 5. Replay Button
    btnReplay.addEventListener('click', () => {
      playBirthAnimation();
    });

    // 6. Retry from Error Modal
    btnRetry.addEventListener('click', () => {
      modalError.classList.add('hidden');
      startArExperience();
    });

    // 7. Setup MindAR events
    setupTargetEvents();

    // 8. Configure WebGL depth, transparency, and render order
    configureMaterials();
    resetEntityStates();
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
