/**
 * 《怪咖機器人阿鏘》兒童互動式數位繪本
 * 核心控制邏輯、音訊管理器與互動引擎 (Vanilla JS)
 * 目標對象：國小三至四年級兒童、親子共讀、SEL 情緒教育教學
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. 頁面資料規格定義 (11 個場景)
  // ==========================================================================
  const PAGES = [
    {
      id: 0,
      title: '封面',
      pageLabel: '故事頁數 1/11',
      image: 'assets/images/original/01封面.jpg',
      narration: null
    },
    {
      id: 1,
      title: '序幕',
      pageLabel: '故事頁數 2/11',
      image: 'assets/images/original/02 扉頁.jpg',
      narration: null
    },
    {
      id: 2,
      title: '故事 1/7',
      pageLabel: '故事頁數 3/11',
      image: 'assets/images/original/0304日常.jpg',
      narration: 'assets/audio/narration/故事旁白_第12頁.mp3'
    },
    {
      id: 3,
      title: '故事 2/7',
      pageLabel: '故事頁數 4/11',
      image: 'assets/images/original/0506第一幕 - 觸發.jpg',
      narration: 'assets/audio/narration/故事旁白_第34頁.mp3'
    },
    {
      id: 4,
      title: '故事 3/7',
      pageLabel: '故事頁數 5/11',
      image: 'assets/images/processed/0708第二幕 -衝突升高.jpg',
      narration: 'assets/audio/narration/故事旁白_第56頁.mp3'
    },
    {
      id: 5,
      title: '故事 4/7',
      pageLabel: '故事頁數 6/11',
      image: 'assets/images/original/0910爆笑出糗.jpg',
      narration: 'assets/audio/narration/故事旁白_第78頁.mp3'
    },
    {
      id: 6,
      title: '故事 5/7',
      pageLabel: '故事頁數 7/11',
      image: 'assets/images/processed/1112第三幕：意外轉折.jpg',
      narration: 'assets/audio/narration/故事旁白_第910頁.mp3'
    },
    {
      id: 7,
      title: '故事 6/7',
      pageLabel: '故事頁數 8/11',
      image: 'assets/images/original/1314第三幕：高潮與主動化解.jpg',
      narration: 'assets/audio/narration/故事旁白_第1112頁.mp3'
    },
    {
      id: 8,
      title: '故事 7/7',
      pageLabel: '故事頁數 9/11',
      image: 'assets/images/original/1516第三幕：收尾共鳴.jpg',
      narration: 'assets/audio/narration/故事旁白_第1314頁.mp3'
    },
    {
      id: 9,
      title: '親子聊聊看',
      pageLabel: '故事頁數 10/11',
      image: 'assets/images/original/封底.jpg',
      narration: 'assets/audio/narration/故事旁白_最後.mp3'
    },
    {
      id: 10,
      title: '結語',
      pageLabel: '故事頁數 11/11',
      image: null,
      narration: null
    }
  ];

  // ==========================================================================
  // 2. 音效檔案清冊對照管理
  // ==========================================================================
  const SOUND_EFFECTS = {
    boom: 'assets/audio/effects/boom.mp3',            // 專用：電鍋蓋彈開、漫天麵粉噴出
    wow: 'assets/audio/effects/wow.mp3',              // 專用：炫光號懸浮登場、同學歡呼
    boil: 'assets/audio/effects/沸騰聲.wav',           // 阿鏘緊張水滾聲
    birth: 'assets/audio/effects/阿鏘誕生.wav',        // 阿鏘組裝完成誕生
    sobbing: 'assets/audio/effects/啜泣.mp3',         // 大寶難過啜泣
    marshmallow: 'assets/audio/effects/棉花糖魔法.wav', // 棉花糖魔法薄霧
    ding: 'assets/audio/effects/溫暖叮聲.wav',         // 保溫溫暖叮聲
    cookerJump: 'assets/audio/effects/電鍋彈跳聲.mp3',  // 電鍋金屬按鍵彈跳
    popcorn: 'assets/audio/effects/爆米花爆炸聲.mp3'    // 48 顆爆米花連環爆炸
  };

  // ==========================================================================
  // 3. DOM 元素快取
  // ==========================================================================
  const scenes = document.querySelectorAll('.scene');
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  const homeBtn = document.getElementById('home-btn');
  const startReadingBtn = document.getElementById('start-reading-btn');
  const enterStoryBtn = document.getElementById('enter-story-btn');
  const restartBtn = document.getElementById('restart-book-btn');
  const pageDotsContainer = document.getElementById('page-dots');
  const pageIndicator = document.getElementById('page-indicator');
  const progressBar = document.getElementById('progress-bar');

  // 扉頁互動元件
  const hotspotSpring = document.getElementById('hotspot-spring');
  const hotspotWrench = document.getElementById('hotspot-wrench');
  const itemSpringStatus = document.getElementById('item-spring-status');
  const itemWrenchStatus = document.getElementById('item-wrench-status');
  const flyleafMissionMsg = document.getElementById('flyleaf-mission-msg');
  const resetFlyleafBtn = document.getElementById('reset-flyleaf-btn');

  // 故事 2/7 互動元件 (接線與阿鏘誕生)
  const hotspotWire = document.getElementById('hotspot-wire');
  const wireLeftPath = document.getElementById('wire-left-path');
  const wireRightPath = document.getElementById('wire-right-path');
  const wireConnectedPath = document.getElementById('wire-connected-path');
  const electricSparks = document.getElementById('electric-sparks');
  const comicZapBubble = document.getElementById('comic-zap-bubble');
  const hotspotRedButton = document.getElementById('hotspot-red-button');
  const comicBurstBanner = document.getElementById('comic-burst-banner');
  const flourCanvas = document.getElementById('flour-canvas');
  const task0506StatusIcon = document.getElementById('task-0506-status-icon');
  const task0506GuideText = document.getElementById('task-0506-guide-text');
  const reset0506Btn = document.getElementById('reset-0506-btn');
  const continue0506Btn = document.getElementById('continue-0506-btn');
  const scene0506VisualBox = document.querySelector('#scene-3 .scene-visual-box');

  // 故事 3/7 第三互動元件 (阿鏘緊張水滾與指針爆表)
  const scene0708VisualBox = document.querySelector('#scene-4 .scene-visual-box');
  const scene0708InteractiveLayer = document.getElementById('scene-0708-interactive-layer');
  const achangHeatGlow = document.getElementById('achang-heat-glow');
  const steamLeftPuff = document.getElementById('steam-left-puff');
  const steamRightPuff = document.getElementById('steam-right-puff');
  const meterGaugeBox = document.getElementById('meter-gauge-box');
  const meterNeedle = document.getElementById('meter-needle');
  const hotspotAchangBelly = document.getElementById('hotspot-achang-belly');
  const chargeRingBar = document.getElementById('charge-ring-bar');
  const comicBoilBubbleLeft = document.getElementById('comic-boil-bubble-left');
  const comicBoilBubbleRight = document.getElementById('comic-boil-bubble-right');
  const comicOverloadBanner = document.getElementById('comic-overload-banner');
  const task0708StatusIcon = document.getElementById('task-0708-status-icon');
  const task0708GuideText = document.getElementById('task-0708-guide-text');
  const reset0708Btn = document.getElementById('reset-0708-btn');
  const continue0708Btn = document.getElementById('continue-0708-btn');

  // 故事 4/7 (0910 爆笑出糗) 第四互動元件
  const scene0910VisualBox = document.querySelector('#scene-5 .scene-visual-box');
  const scene0910InteractiveLayer = document.getElementById('scene-0910-interactive-layer');
  const achangPopcornGlow = document.getElementById('achang-popcorn-glow');
  const cookerLidJump = document.getElementById('cooker-lid-jump');
  const popcornSteamBurst = document.getElementById('popcorn-steam-burst');
  const popcornParticlesContainer = document.getElementById('popcorn-particles-container');
  const hotspotAchangCooker = document.getElementById('hotspot-achang-cooker');
  const task0910StatusIcon = document.getElementById('task-0910-status-icon');
  const task0910GuideText = document.getElementById('task-0910-guide-text');
  const reset0910Btn = document.getElementById('reset-0910-btn');
  const continue0910Btn = document.getElementById('continue-0910-btn');

  // 故事 5/7 (1112 意外轉折) 第五互動元件
  const hotspotExamPaper = document.getElementById('hotspot-exam-paper');
  const hotspotDabaoCry = document.getElementById('hotspot-dabao-cry');
  const hotspotFriendsConcern = document.getElementById('hotspot-friends-concern') || document.getElementById('hotspot-achang-concern');
  const hotspotAchangConcern = hotspotFriendsConcern;
  const bubbleExam = document.getElementById('bubble-exam');
  const bubbleDabao = document.getElementById('bubble-dabao');
  const bubbleFriends = document.getElementById('bubble-friends') || document.getElementById('bubble-achang');
  const bubbleAchang = bubbleFriends;
  const stepIcon1112 = document.getElementById('step-icon-1112');
  const guideText1112 = document.getElementById('guide-text-1112');
  const reset1112Btn = document.getElementById('reset-1112-btn');
  const companionChoiceContainer = document.getElementById('companion-choice-container');
  const companionBtns = document.querySelectorAll('.companion-btn');
  const choiceFeedbackBox = document.getElementById('choice-feedback-box');
  const feedbackText = document.getElementById('feedback-text');
  const bubbleCloseBtns = document.querySelectorAll('.bubble-close-btn');

  // 故事 6/7 (1314 高潮與主動化解) 第六互動元件
  const scene1314Overlay = document.getElementById('scene-1314-overlay');
  const achangHeartGlow = document.getElementById('achang-heart-glow');
  const magicStreamSvg = document.getElementById('magic-stream-svg');
  const marshmallowMagicAura = document.getElementById('marshmallow-magic-aura');
  const marshmallowCanvas = document.getElementById('marshmallow-canvas');
  const hotspotAchangHeart = document.getElementById('hotspot-achang-heart');
  const stepIcon1314 = document.getElementById('step-icon-1314');
  const guideText1314 = document.getElementById('guide-text-1314');
  const reset1314Btn = document.getElementById('reset-1314-btn');
  const warmthFeedbackBox = document.getElementById('warmth-feedback-box');

  // 故事 7/7 (1516 收尾共鳴) 第七互動元件
  const scene1516Overlay = document.getElementById('scene-1516-overlay');
  const hotspotCupcakes = document.getElementById('hotspot-cupcakes');
  const hotspotDabaoSmile = document.getElementById('hotspot-dabao-smile');
  const hotspotHandsTogether = document.getElementById('hotspot-hands-together');
  const hotspotMoXuangguang = document.getElementById('hotspot-mo-xuangguang');
  const hotspotXiaomo = document.getElementById('hotspot-xiaomo');
  const friendsTagShared = document.getElementById('friends-tag-shared');
  const bubbleCupcakes = document.getElementById('bubble-cupcakes');
  const bubbleDabao1516 = document.getElementById('bubble-dabao-1516');
  const bubbleHands1516 = document.getElementById('bubble-hands-1516');
  const bubbleFriends1516 = document.getElementById('bubble-friends-1516');
  const cupcakeWarmGlow = document.getElementById('cupcake-warm-glow');
  const stepIcon1516 = document.getElementById('step-icon-1516');
  const guideText1516 = document.getElementById('guide-text-1516');
  const reset1516Btn = document.getElementById('reset-1516-btn');

  // 音訊與控制元件
  const bgmAudio = document.getElementById('bgm-audio');
  const narrationAudio = document.getElementById('narration-audio');
  const bgmToggleBtn = document.getElementById('bgm-toggle-btn');
  const bgmIcon = document.getElementById('bgm-icon');
  const bgmVolSlider = document.getElementById('bgm-vol');
  const narrationPlayBtn = document.getElementById('narration-play-btn');
  const narrationIcon = document.getElementById('narration-icon');
  const narrationReplayBtn = document.getElementById('narration-replay-btn');
  const narrationVolSlider = document.getElementById('narration-vol');
  const autoNarrationChk = document.getElementById('auto-narration-chk');
  const speedBtns = document.querySelectorAll('.speed-btn');

  // 故事討論卡片折疊按鈕
  const discussionToggleBtns = document.querySelectorAll('.discussion-toggle-btn');

  // ==========================================================================
  // 4. 應用狀態管理 (State)
  // ==========================================================================
  let currentPageIndex = 0;
  let hasUserInteracted = false; // 是否已解鎖瀏覽器 Audio Context
  let isBgmEnabled = false;
  let userBgmVolume = 0.35;
  let userNarrationVolume = 1.0;
  let currentPlaybackRate = 1.0;
  let isNarrationPlaying = false;
  let duckingInterval = null;

  // 扉頁第一互動狀態：尋找舊發條與小扳手
  let hasFoundSpring = false;
  let hasFoundWrench = false;

  // 故事 2/7 第二互動狀態：接線與阿鏘誕生
  let is0506WireConnected = false;
  let is0506SequenceRunning = false;
  let is0506Completed = false;
  let flourAnimationId = null;

  // 03-04 頁專用互動音效物件
  const audioBirth = new Audio(SOUND_EFFECTS.birth);
  const audioCooker = new Audio(SOUND_EFFECTS.cookerJump);
  const audioBoom = new Audio(SOUND_EFFECTS.boom);

  // 故事 3/7 第三互動狀態：阿鏘緊張指針劇烈晃動與沸騰
  let is0708Running = false;        // 動畫是否正在進行中
  let is0708Completed = false;      // 是否已達爆表完成階段
  let needleAngle0708 = -90.0;      // 當前指針角度 (範圍 -90.0 ~ +90.0，完整 180° 水平掃動)
  let boilChargeAnimId = null;      // requestAnimationFrame 計時器
  let boilStartTime0708 = null;     // 動畫啟動時間戳

  // 07-08 頁專用沸騰水滾音效物件
  const audioBoil = new Audio(SOUND_EFFECTS.boil);
  audioBoil.loop = true;

  // 故事 4/7 第四互動狀態：爆米花大爆發
  let is0910Running = false;        // 爆發動畫是否正在進行中
  let is0910Completed = false;      // 是否已完成爆發
  let popcornAnimTimeouts = [];     // 爆發計時器陣列
  let popcornFadeInterval = null;   // 音效淡出計時器
  const audioPopcorn = new Audio(SOUND_EFFECTS.popcorn);

  // 故事 5/7 第五互動狀態：意外轉折與情感陪伴
  let isExamObserved = false;
  let isDabaoObserved = false;
  let isAchangObserved = false;
  let isFriendsObserved = false;
  let selectedCompanionChoice = null;
  let is1112Completed = false;
  let hasPlayedSobbing = false;
  const audioSobbing = new Audio(SOUND_EFFECTS.sobbing);

  // 故事 6/7 第六互動狀態：主動化解與棉花糖魔法
  let is1314Running = false;
  let is1314Completed = false;
  let marshmallowAnimTimeouts = [];
  let marshmallowParticlesAnimId = null;
  let marshmallowParticles = [];
  const audioDing = new Audio(SOUND_EFFECTS.ding);
  const audioMarshmallow = new Audio(SOUND_EFFECTS.marshmallow);

  // 故事 7/7 第七互動狀態：收尾共鳴自由探索
  let isCupcakesExplored = false;
  let isDabao1516Explored = false;
  let isHands1516Explored = false;
  let isFriends1516Explored = false;

  // ==========================================================================
  // 5. 初始化與頁碼導覽點生成
  // ==========================================================================
  function init() {
    initPageDots();
    initAudioDefaults();
    bindEvents();

    // 支援 URL 查詢參數快速跳頁與自動測試 (例如 ?page=4 或 ?page=5&autostart=true)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');
      if (pageParam !== null) {
        const parsedPage = parseInt(pageParam, 10);
        if (!isNaN(parsedPage) && parsedPage >= 0 && parsedPage < PAGES.length) {
          currentPageIndex = parsedPage;
        }
      }
      if (urlParams.get('autostart') === 'true') {
        setTimeout(() => {
          if (currentPageIndex === 4 && typeof start0708Interaction === 'function') {
            start0708Interaction();
          } else if (currentPageIndex === 5 && typeof start0910Interaction === 'function') {
            start0910Interaction();
          } else if (currentPageIndex === 6 && typeof autostart1112Interaction === 'function') {
            autostart1112Interaction();
          } else if (currentPageIndex === 7 && typeof start1314Interaction === 'function') {
            start1314Interaction();
          } else if (currentPageIndex === 8 && typeof exploreCupcakes === 'function') {
            exploreCupcakes();
          }
        }, 300);
      }
    } catch (e) {}

    renderPage(currentPageIndex);
    console.log('《怪咖機器人阿鏘》數位繪本核心架構已成功初始化。');
  }

  function initPageDots() {
    pageDotsContainer.innerHTML = '';
    PAGES.forEach((page, idx) => {
      const dot = document.createElement('button');
      dot.className = `dot-btn ${idx === 0 ? 'active' : ''}`;
      dot.title = `跳轉至：${page.title}`;
      dot.setAttribute('aria-label', page.title);
      dot.addEventListener('click', () => {
        unlockAudio();
        goToPage(idx);
      });
      pageDotsContainer.appendChild(dot);
    });
  }

  function initAudioDefaults() {
    bgmAudio.volume = userBgmVolume;
    narrationAudio.volume = userNarrationVolume;
    narrationAudio.playbackRate = currentPlaybackRate;
    bgmVolSlider.value = userBgmVolume;
    narrationVolSlider.value = userNarrationVolume;
    updateBgmUiState(false);
  }

  // ==========================================================================
  // 6. 音訊管理系統 (BGM, Narration, Audio Ducking, Speed)
  // ==========================================================================

  // 使用者首度互動後解鎖音訊政策
  function unlockAudio() {
    if (!hasUserInteracted) {
      hasUserInteracted = true;
    }
  }

  // 背景音樂 UI 狀態更新（依照播放/靜音即時切換）
  function updateBgmUiState(isPlaying) {
    if (isPlaying) {
      bgmToggleBtn.classList.add('active');
    } else {
      bgmToggleBtn.classList.remove('active');
    }
    bgmIcon.textContent = '🎵'; // 始終維持原本音符圖示，靜音禁止符號由 CSS 疊加呈現
  }

  // 背景音樂播放
  function startBgm() {
    isBgmEnabled = true;
    bgmAudio.volume = isNarrationPlaying ? userBgmVolume * 0.25 : userBgmVolume;
    bgmAudio.play().then(() => {
      updateBgmUiState(true);
    }).catch(err => {
      console.warn('BGM 自動播放被瀏覽器策略限制，等待使用者點擊：', err);
    });
  }

  // 背景音樂暫停
  function pauseBgm() {
    isBgmEnabled = false;
    bgmAudio.pause();
    updateBgmUiState(false);
  }

  // 背景音樂切換
  function toggleBgm() {
    unlockAudio();
    if (bgmAudio.paused) {
      startBgm();
    } else {
      pauseBgm();
    }
  }

  // 平滑音量避讓 (Audio Ducking)：旁白播放時降低 BGM，旁白結束時平滑恢復
  function duckBgm(duck) {
    if (!isBgmEnabled || bgmAudio.paused) return;
    
    clearInterval(duckingInterval);
    const targetVolume = duck ? userBgmVolume * 0.25 : userBgmVolume;
    const step = (targetVolume - bgmAudio.volume) / 10;
    
    duckingInterval = setInterval(() => {
      if (Math.abs(bgmAudio.volume - targetVolume) < 0.02) {
        bgmAudio.volume = targetVolume;
        clearInterval(duckingInterval);
      } else {
        bgmAudio.volume = Math.max(0, Math.min(1, bgmAudio.volume + step));
      }
    }, 30);
  }

  // 旁白控制核心
  function stopCurrentNarration() {
    narrationAudio.pause();
    narrationAudio.currentTime = 0;
    isNarrationPlaying = false;
    narrationPlayBtn.classList.remove('active');
    narrationIcon.textContent = '🔊';
    duckBgm(false);
  }

  function setPlaybackRate(speed) {
    currentPlaybackRate = parseFloat(speed) || 1.0;
    narrationAudio.playbackRate = currentPlaybackRate;
    speedBtns.forEach(btn => {
      const btnSpeed = parseFloat(btn.dataset.speed);
      btn.classList.toggle('active', Math.abs(btnSpeed - currentPlaybackRate) < 0.05);
    });
  }

  function loadAndPlayNarration(narrationPath, autoPlay = true) {
    // 嚴防重疊：切換前徹底重置
    stopCurrentNarration();

    if (!narrationPath) {
      narrationPlayBtn.disabled = true;
      narrationReplayBtn.disabled = true;
      narrationPlayBtn.title = '此頁無旁白';
      return;
    }

    narrationPlayBtn.disabled = false;
    narrationReplayBtn.disabled = false;
    narrationPlayBtn.title = '播放 / 暫停旁白';

    narrationAudio.src = narrationPath;
    narrationAudio.load();
    narrationAudio.playbackRate = currentPlaybackRate;

    if (autoPlay && hasUserInteracted && autoNarrationChk.checked) {
      playNarration();
    }
  }

  function playNarration() {
    if (!narrationAudio.src || narrationAudio.src.endsWith('null')) return;

    narrationAudio.playbackRate = currentPlaybackRate;
    narrationAudio.play().then(() => {
      isNarrationPlaying = true;
      narrationPlayBtn.classList.add('active');
      narrationIcon.textContent = '⏸️';
      duckBgm(true);
    }).catch(err => {
      console.warn('旁白播放提示：', err);
      isNarrationPlaying = false;
      narrationPlayBtn.classList.remove('active');
      narrationIcon.textContent = '🔊';
    });
  }

  function pauseNarration() {
    narrationAudio.pause();
    isNarrationPlaying = false;
    narrationPlayBtn.classList.remove('active');
    narrationIcon.textContent = '🔊';
    duckBgm(false);
  }

  function toggleNarration() {
    unlockAudio();
    if (!narrationAudio.src) return;

    if (narrationAudio.paused) {
      playNarration();
    } else {
      pauseNarration();
    }
  }

  function replayNarration() {
    unlockAudio();
    if (!narrationAudio.src) return;
    narrationAudio.currentTime = 0;
    playNarration();
  }

  // ==========================================================================
  // 7. 頁面切換與畫面渲染核心
  // ==========================================================================
  function goToPage(index) {
    if (index < 0 || index >= PAGES.length) return;
    
    // 1. 停止並重置前一頁音訊，杜絕重疊
    stopCurrentNarration();
    stop0506Audio();
    stop0708Audio();
    stop0910Audio();
    stop1112Audio();
    stop1314Audio();
    stop1516Audio();

    // 2. 更新狀態與畫面呈現
    currentPageIndex = index;
    renderPage(currentPageIndex);

    // 3. 處理當前頁音訊
    const pageData = PAGES[currentPageIndex];
    if (pageData.narration) {
      // 封底 (index 9) 依需求不自動播放整段故事旁白，保持閱讀後的溫暖安靜；讀者若想聆聽提問仍可手動點擊播放按鈕
      const shouldAutoPlay = (currentPageIndex !== 9);
      loadAndPlayNarration(pageData.narration, shouldAutoPlay);
    } else {
      loadAndPlayNarration(null, false);
    }

    // 4. 結束頁處理：若到達結語頁，平滑淡停 BGM
    if (currentPageIndex === PAGES.length - 1 && isBgmEnabled) {
      pauseBgm();
    }
  }

  function nextPage() {
    unlockAudio();
    if (currentPageIndex < PAGES.length - 1) {
      goToPage(currentPageIndex + 1);
    } else {
      goToPage(0); // 最後一頁循環回封面
    }
  }

  function prevPage() {
    unlockAudio();
    if (currentPageIndex > 0) {
      goToPage(currentPageIndex - 1);
    }
  }

  function renderPage(index) {
    const pageData = PAGES[index];

    // 切換場景 active class
    scenes.forEach((scene, idx) => {
      scene.classList.toggle('active', idx === index);
    });

    // 更新頂部場景頁數 (格式嚴格遵循 故事頁數 1/11 ~ 故事頁數 11/11) 與進度條
    pageIndicator.textContent = `故事頁數 ${index + 1}/11`;
    const progressPercent = Math.round(((index + 1) / PAGES.length) * 100);
    progressBar.style.width = `${progressPercent}%`;

    // 更新底部上一頁/下一頁狀態（全書自由翻頁：所有場景下一頁均保持可點擊）
    prevBtn.disabled = (index === 0);
    if (index === PAGES.length - 1) {
      nextBtn.innerHTML = `<span>回到封面 ↺</span>`;
      nextBtn.disabled = false;
      nextBtn.title = '回到封面';
    } else {
      nextBtn.innerHTML = `<span>下一頁</span><span class="arrow-icon">→</span>`;
      nextBtn.disabled = false;
      nextBtn.title = '下一頁';
    }

    // 更新導覽圓點 active 狀態
    const dots = pageDotsContainer.querySelectorAll('.dot-btn');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });

    // 滾動至頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // 8. 扉頁第一互動：尋找零件，喚醒舊物
  // ==========================================================================

  // 齒輪點擊與金屬機械回饋音效
  function playGearClickSound() {
    unlockAudio();
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      [0, 0.045, 0.09].forEach((offset, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(680 + idx * 240, now + offset);
        osc.frequency.exponentialRampToValueAtTime(180, now + offset + 0.04);
        gain.gain.setValueAtTime(0.35, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.045);
      });
    } catch (e) {
      console.log('Audio feedback fallback:', e);
    }
  }

  // 兩樣零件集齊時的勝利音效回饋
  function playMissionSuccessSound() {
    unlockAudio();
    try {
      const audio = new Audio(SOUND_EFFECTS.ding);
      audio.volume = userNarrationVolume * 0.8;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  // 點擊找到舊發條
  function findSpring() {
    unlockAudio();
    if (hasFoundSpring) return;
    hasFoundSpring = true;
    hotspotSpring.classList.add('found');
    itemSpringStatus.classList.add('completed');
    itemSpringStatus.querySelector('.check-box').textContent = '✅';
    playGearClickSound();
    checkFlyleafMission();
  }

  // 點擊找到小扳手
  function findWrench() {
    unlockAudio();
    if (hasFoundWrench) return;
    hasFoundWrench = true;
    hotspotWrench.classList.add('found');
    itemWrenchStatus.classList.add('completed');
    itemWrenchStatus.querySelector('.check-box').textContent = '✅';
    playGearClickSound();
    checkFlyleafMission();
  }

  // 檢查扉頁任務進度
  function checkFlyleafMission() {
    if (hasFoundSpring && hasFoundWrench) {
      flyleafMissionMsg.textContent = '太棒了！零件找齊了，小宇準備開始組裝阿鏘！';
      flyleafMissionMsg.classList.add('success');
      enterStoryBtn.disabled = false;
      enterStoryBtn.classList.add('ready', 'pulse-anim');
      playMissionSuccessSound();
    } else if (hasFoundSpring) {
      flyleafMissionMsg.textContent = '已找到舊發條！工作桌上還有小扳手，仔細找找看。';
      flyleafMissionMsg.classList.remove('success');
    } else if (hasFoundWrench) {
      flyleafMissionMsg.textContent = '已找到小扳手！工作桌上還有舊發條，仔細找找看。';
      flyleafMissionMsg.classList.remove('success');
    }
  }

  // 重置扉頁任務狀態
  function resetFlyleafTask() {
    hasFoundSpring = false;
    hasFoundWrench = false;
    hotspotSpring.classList.remove('found');
    hotspotWrench.classList.remove('found');
    itemSpringStatus.classList.remove('completed');
    itemSpringStatus.querySelector('.check-box').textContent = '⚪';
    itemWrenchStatus.classList.remove('completed');
    itemWrenchStatus.querySelector('.check-box').textContent = '⚪';
    flyleafMissionMsg.textContent = '請在右邊的工作桌上，點擊找出這兩樣工具。';
    flyleafMissionMsg.classList.remove('success');
    enterStoryBtn.disabled = false;
    enterStoryBtn.classList.remove('ready', 'pulse-anim');
  }

  // ==========================================================================
  // 9. 故事 2/7 第二互動：接線與阿鏘誕生
  // ==========================================================================

  // 停止並重置 0506 專用音效
  function stop0506Audio() {
    audioBirth.pause();
    audioBirth.currentTime = 0;
    audioCooker.pause();
    audioCooker.currentTime = 0;
    audioBoom.pause();
    audioBoom.currentTime = 0;
    if (scene0506VisualBox) scene0506VisualBox.classList.remove('vibrating');
  }

  // 滋啦！電火花音效合成器
  function playElectricZapSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      [0, 0.03, 0.065, 0.1].forEach((offset, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400 - idx * 250, now + offset);
        gain.gain.setValueAtTime(0.25, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.035);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.04);
      });
    } catch (e) {}
  }

  // 麵粉與玉米粒噴散 Canvas 粒子系統
  function startFlourEruption() {
    if (!flourCanvas) return;
    const ctx = flourCanvas.getContext('2d');
    const rect = flourCanvas.getBoundingClientRect();
    flourCanvas.width = rect.width;
    flourCanvas.height = rect.height;

    // 粒子發射原點：阿鏘掀開的鍋蓋口位置 (約 X: 72%, Y: 26%)
    const originX = flourCanvas.width * 0.72;
    const originY = flourCanvas.height * 0.26;

    const particles = [];
    // 1. 生成 110 顆漫天白麵粉白糖微粒
    for (let i = 0; i < 110; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 4 + Math.random() * 8.5;
      particles.push({
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 8,
        color: Math.random() > 0.3 ? '#ffffff' : '#fff9ed',
        alpha: 0.75 + Math.random() * 0.25,
        type: 'flour',
        drag: 0.97,
        gravity: 0.18,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.05 + Math.random() * 0.08
      });
    }

    // 2. 生成 30 顆金黃玉米粒
    for (let i = 0; i < 30; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = 5 + Math.random() * 9.5;
      particles.push({
        x: originX + (Math.random() - 0.5) * 30,
        y: originY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 4 + Math.random() * 3,
        color: '#f5c038',
        alpha: 0.95,
        type: 'corn',
        drag: 0.985,
        gravity: 0.26,
        wobble: 0,
        wobbleSpeed: 0
      });
    }

    const startTime = performance.now();
    function animate(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, flourCanvas.width, flourCanvas.height);

      particles.forEach((p) => {
        p.vx *= p.drag;
        p.vy += p.gravity;
        if (p.type === 'flour') {
          p.wobble += p.wobbleSpeed;
          p.x += p.vx + Math.sin(p.wobble) * 1.2;
        } else {
          p.x += p.vx;
        }
        p.y += p.vy;

        const fade = Math.max(0, 1 - elapsed / 3600);
        ctx.save();
        ctx.globalAlpha = p.alpha * fade;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        if (p.type === 'flour') {
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        } else {
          ctx.ellipse(p.x, p.y, p.radius * 1.2, p.radius * 0.8, 0.4, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      });

      if (elapsed < 3600) {
        flourAnimationId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, flourCanvas.width, flourCanvas.height);
      }
    }
    cancelAnimationFrame(flourAnimationId);
    flourAnimationId = requestAnimationFrame(animate);
  }

  // 第一階段：桌面上接線
  function connectWire() {
    unlockAudio();
    if (is0506WireConnected) return;
    is0506WireConnected = true;

    // SVG 電線連通呈現
    if (wireLeftPath) wireLeftPath.style.display = 'none';
    if (wireRightPath) wireRightPath.style.display = 'none';
    if (wireConnectedPath) wireConnectedPath.style.display = 'block';
    if (electricSparks) electricSparks.style.display = 'block';

    // 滋啦！電火花氣泡
    if (comicZapBubble) comicZapBubble.classList.add('show');
    playElectricZapSound();

    // 熱區狀態切換
    if (hotspotWire) hotspotWire.classList.add('connected');
    if (hotspotRedButton) {
      hotspotRedButton.classList.remove('locked');
      hotspotRedButton.classList.add('ready');
    }

    // 任務指示文字切換至第二階段
    if (task0506StatusIcon) task0506StatusIcon.textContent = '⚡';
    if (task0506GuideText) task0506GuideText.textContent = '電線接通了！現在按下阿鏘肚子上的紅色開關！';

    setTimeout(() => {
      if (comicZapBubble) comicZapBubble.classList.remove('show');
      if (electricSparks) electricSparks.style.display = 'none';
    }, 1300);
  }

  // 第二與第三階段：按下開關，依序觸發「阿鏘誕生 -> 電鍋彈跳 -> boom噴麵粉」
  function pressRedButton() {
    unlockAudio();
    if (!is0506WireConnected) {
      if (task0506GuideText) {
        task0506GuideText.textContent = '請先在桌上接好電線，才能啟動阿鏘！';
      }
      return;
    }
    // 防止重複點擊造成音效重疊
    if (is0506SequenceRunning) return;
    is0506SequenceRunning = true;

    // 按鈕下壓視覺與機身震動
    if (hotspotRedButton) {
      hotspotRedButton.classList.add('pressed');
      hotspotRedButton.classList.remove('ready');
    }
    if (scene0506VisualBox) scene0506VisualBox.classList.add('vibrating');

    // 暫停旁白並避讓 BGM
    stopCurrentNarration();
    duckBgm(true);

    if (task0506StatusIcon) task0506StatusIcon.textContent = '⚙️';
    if (task0506GuideText) task0506GuideText.textContent = '阿鏘啟動中……機身開始發熱震動了！';

    // 依序觸發音效 1：阿鏘誕生.wav (機械啟動)
    audioBirth.volume = userNarrationVolume;
    audioBirth.currentTime = 0;
    audioBirth.play().catch(() => {});

    // 依序觸發音效 2：電鍋彈跳聲.mp3 (約 2.0 秒時，金屬開關與鍋蓋彈起)
    setTimeout(() => {
      if (!is0506SequenceRunning) return;
      audioCooker.volume = userNarrationVolume;
      audioCooker.currentTime = 0;
      audioCooker.play().catch(() => {});
    }, 2000);

    // 依序觸發音效 3：boom.mp3 (約 2.5 秒時，漫天白麵粉噴出)
    setTimeout(() => {
      if (!is0506SequenceRunning) return;
      if (scene0506VisualBox) scene0506VisualBox.classList.remove('vibrating');

      audioBoom.volume = userNarrationVolume;
      audioBoom.currentTime = 0;
      audioBoom.play().catch(() => {});

      // 觸發白麵粉與玉米粒噴射粒子動畫
      startFlourEruption();
      if (comicBurstBanner) comicBurstBanner.classList.add('show');

      if (task0506StatusIcon) task0506StatusIcon.textContent = '💥';
      if (task0506GuideText) task0506GuideText.textContent = '「鏘——！」漫天白麵粉噴出，阿鏘誕生了！';
    }, 2500);

    // 第四階段：完成結算 (約 5.6 秒時，顯示繼續閱讀按鈕)
    setTimeout(() => {
      if (!is0506SequenceRunning) return;
      is0506SequenceRunning = false;
      is0506Completed = true;

      if (task0506StatusIcon) task0506StatusIcon.textContent = '🎉';
      if (task0506GuideText) task0506GuideText.textContent = '太好了！阿鏘誕生了，小宇變成了白糖小河狸！';

      if (continue0506Btn) continue0506Btn.style.display = 'inline-flex';
      duckBgm(false);
    }, 5600);
  }

  // 重置 0506 互動任務狀態
  function reset0506Task() {
    stop0506Audio();
    is0506WireConnected = false;
    is0506SequenceRunning = false;
    is0506Completed = false;

    if (flourCanvas) {
      cancelAnimationFrame(flourAnimationId);
      const ctx = flourCanvas.getContext('2d');
      ctx.clearRect(0, 0, flourCanvas.width, flourCanvas.height);
    }

    if (wireLeftPath) wireLeftPath.style.display = 'block';
    if (wireRightPath) wireRightPath.style.display = 'block';
    if (wireConnectedPath) wireConnectedPath.style.display = 'none';
    if (electricSparks) electricSparks.style.display = 'none';

    if (hotspotWire) hotspotWire.classList.remove('connected');
    if (hotspotRedButton) {
      hotspotRedButton.classList.remove('ready', 'pressed');
      hotspotRedButton.classList.add('locked');
    }

    if (comicZapBubble) comicZapBubble.classList.remove('show');
    if (comicBurstBanner) comicBurstBanner.classList.remove('show');
    if (continue0506Btn) continue0506Btn.style.display = 'none';

    if (task0506StatusIcon) task0506StatusIcon.textContent = '🔌';
    if (task0506GuideText) task0506GuideText.textContent = '幫小宇把電線接起來，再按下阿鏘肚子上的紅色開關！';
    if (scene0506VisualBox) scene0506VisualBox.classList.remove('vibrating');
  }

  // ==========================================================================
  // 9.1 故事 3/7 第三互動：阿鏘緊張指針劇烈晃動與沸騰
  // ==========================================================================

  // 停止並重置 0708 專用音效與動畫迴圈
  function stop0708Audio() {
    audioBoil.pause();
    audioBoil.currentTime = 0;
    if (scene0708VisualBox) {
      scene0708VisualBox.classList.remove('vibrating-mild', 'vibrating-intense');
    }
    cancelAnimationFrame(boilChargeAnimId);
    boilChargeAnimId = null;
    boilStartTime0708 = null;
    is0708Running = false;
    if (hotspotAchangBelly) {
      hotspotAchangBelly.classList.remove('holding');
    }
  }

  // 點擊正式啟動 0708 互動（指針劇烈晃動、水滾沸騰、冒煙震動與爆表）
  function start0708Interaction() {
    unlockAudio();
    if (is0708Running || is0708Completed) return;
    is0708Running = true;

    // 1. 立即完全移除按鈕周圍紅色提示圈、浮動標籤與多餘裝飾光暈（按鈕本體保留，色環與指針正常運作）
    if (scene0708InteractiveLayer) {
      scene0708InteractiveLayer.classList.add('interaction-active');
    }
    if (hotspotAchangBelly) {
      hotspotAchangBelly.classList.add('active-running');
      hotspotAchangBelly.classList.remove('holding');
      try { hotspotAchangBelly.blur(); } catch (e) {}
      const halos = hotspotAchangBelly.querySelectorAll('.scene-hint-halo, .belly-halo');
      halos.forEach(h => {
        h.style.display = 'none';
        h.style.animation = 'none';
        h.style.opacity = '0';
        h.style.visibility = 'hidden';
        h.style.boxShadow = 'none';
        h.style.border = 'none';
        h.style.background = 'transparent';
      });
      const tags = hotspotAchangBelly.querySelectorAll('.scene-hint-tag, .belly-tag');
      tags.forEach(t => {
        t.style.display = 'none';
        t.style.animation = 'none';
        t.style.opacity = '0';
        t.style.visibility = 'hidden';
      });
    }
    if (meterGaugeBox) {
      try { meterGaugeBox.blur(); } catch (e) {}
    }
    if (achangHeatGlow) {
      achangHeatGlow.classList.remove('heating');
      achangHeatGlow.style.display = 'none';
      achangHeatGlow.style.opacity = '0';
    }

    // 2. 啟動沸騰音效並避讓背景音樂（防重複播放疊加）
    try {
      audioBoil.volume = userNarrationVolume * 0.9;
      audioBoil.currentTime = 0;
      audioBoil.playbackRate = 1.0;
      audioBoil.play().catch(() => {});
      duckBgm(true);
    } catch (e) {}

    // 3. 啟動非等速、不規則的物理指針劇烈晃動迴圈 (requestAnimationFrame)
    boilStartTime0708 = performance.now();
    const DURATION = 4000; // 4.0 秒完整呈現升溫蓄壓與劇烈晃動過程

    function animateStep(now) {
      if (!is0708Running || is0708Completed) return;

      const elapsed = now - boilStartTime0708;
      const progress = Math.min(1.0, elapsed / DURATION);

      // (A) 完整 180° 水平劇烈來回擺動：自左側水平藍色端 (-90°) 開始，快速橫掃過中間垂直方向 (0°) 直達右側水平紅色端 (+90°)，迅速反向並持續不規則來回晃動
      const freq = 1.5 + progress * 1.2;
      const phi = -Math.PI / 2.0 + (elapsed / 1000.0) * freq * 2.0 * Math.PI;

      const rawSin = Math.sin(phi);
      const sign = rawSin >= 0 ? 1.0 : -1.0;
      // 擺動端點短暫停留後快速折返（符合高壓指針物理特性）
      const sweepFactor = sign * Math.pow(Math.abs(rawSin), 0.82);

      // 高頻緊張神經質細微顫抖 (Chaotic micro-tremble)
      const tremble = (Math.sin(elapsed * 0.065) * (2.5 + progress * 3.5) + Math.cos(elapsed * 0.137) * (1.5 + progress * 2.0)) * Math.min(1.0, elapsed / 250.0);

      let targetAngle;
      if (progress >= 0.96) {
        // 接近爆表時，在右側水平紅色極限區 (+90°) 劇烈震顫
        targetAngle = 88.5 + Math.sin(elapsed * 0.18) * 1.5;
      } else {
        // 完整 180° 水平掃動：從 -90° (左側水平藍色端) 到 +90° (右側水平紅色端)
        targetAngle = sweepFactor * 90.0 + tremble;
      }

      // (B) 嚴格硬性限制：指針尖端始終且絕對限制在 -90.0度 ~ +90.0度（完整 180° 水平扇形範圍）
      // 絕不超出左右水平端點、不整圈旋轉、絕不向下向空白區擺動！
      const MIN_ARC_LIMIT = -90.0;
      const MAX_ARC_LIMIT = 90.0;
      needleAngle0708 = Math.max(MIN_ARC_LIMIT, Math.min(MAX_ARC_LIMIT, targetAngle));

      // 套用至新 SVG 指針（旋轉中心精準鎖定在小圓點 0, 0，不整支平移、不上下跳動）
      if (meterNeedle) {
        meterNeedle.setAttribute('transform', `rotate(${needleAngle0708.toFixed(1)})`);
      }

      // (C) 阿鏘緊張升溫生理反饋（蒸氣升騰與動態氣泡提示；底圖與色環完全保持靜止不動）

      // 左右排氣孔白煙升騰
      if (steamLeftPuff && steamRightPuff) {
        if (progress > 0.12) {
          steamLeftPuff.classList.add('steaming');
          steamRightPuff.classList.add('steaming');
        }
      }

      // 「啵嚕啵嚕！」動態音效氣泡 (在中段出現)
      if (comicBoilBubbleLeft && comicBoilBubbleRight) {
        if (progress >= 0.28 && progress < 0.92) {
          comicBoilBubbleLeft.classList.add('show');
          comicBoilBubbleRight.classList.add('show');
        } else {
          comicBoilBubbleLeft.classList.remove('show');
          comicBoilBubbleRight.classList.remove('show');
        }
      }

      // 沸騰水滾音效動態變頻（隨緊張度提升而急促）
      try {
        audioBoil.playbackRate = Math.min(1.6, 1.0 + progress * 0.58);
      } catch (e) {}

      // 更新引導提示卡
      if (task0708StatusIcon && task0708GuideText) {
        if (progress >= 0.70) {
          task0708StatusIcon.textContent = '♨️';
          task0708GuideText.textContent = '快要爆表了！指針在紅色警戒區狂晃，頭頂白煙狂噴！';
        } else if (progress >= 0.25) {
          task0708StatusIcon.textContent = '💧';
          task0708GuideText.textContent = '阿鏘超緊張！指針劇烈來回晃動，肚子發出「啵嚕啵嚕」水滾聲……';
        } else {
          task0708StatusIcon.textContent = '🧭';
          task0708GuideText.textContent = '阿鏘開始緊張了！指針開始劇烈左右擺動……';
        }
      }

      // (D) 達到 100% 進入爆表結算
      if (progress >= 1.0) {
        completeBoilOverload();
      } else {
        boilChargeAnimId = requestAnimationFrame(animateStep);
      }
    }

    cancelAnimationFrame(boilChargeAnimId);
    boilChargeAnimId = requestAnimationFrame(animateStep);
  }

  // 爆表完成階段（指針抵達極限、過載橫幅、完成提示與引導按鈕）
  function completeBoilOverload() {
    is0708Running = false;
    is0708Completed = true;
    cancelAnimationFrame(boilChargeAnimId);
    boilChargeAnimId = null;

    // 指針停留在紅色警戒區內 (穩穩停在 +90deg 右側水平紅色色環端，不超出紅區、不向空白處跑)
    needleAngle0708 = 90.0;
    if (meterNeedle) {
      meterNeedle.setAttribute('transform', 'rotate(90)');
    }

    // 播放金屬電鍋開關彈跳極限聲
    try {
      audioCooker.volume = userNarrationVolume;
      audioCooker.currentTime = 0;
      audioCooker.play().catch(() => {});
    } catch (e) {}

    // 沸騰聲延遲平滑淡停並還原 BGM
    setTimeout(() => {
      audioBoil.pause();
      if (!isNarrationPlaying) duckBgm(false);
    }, 1300);

    // 顯示指針爆表橫幅
    if (comicOverloadBanner) {
      comicOverloadBanner.classList.add('show');
    }

    // 更新任務提示文字與顯示下一頁按鈕
    if (task0708StatusIcon) task0708StatusIcon.textContent = '💥';
    if (task0708GuideText) {
      task0708GuideText.textContent = '指針爆表了！阿鏘不是故意出錯的，它只是面對壓力太緊張了。';
    }

    if (continue0708Btn) {
      continue0708Btn.style.display = 'inline-flex';
    }

    if (hotspotAchangBelly) {
      hotspotAchangBelly.classList.remove('active-running');
      hotspotAchangBelly.classList.add('completed');
      try { hotspotAchangBelly.blur(); } catch (e) {}
      const halos = hotspotAchangBelly.querySelectorAll('.scene-hint-halo, .belly-halo');
      halos.forEach(h => { h.style.display = 'none'; });
      const tags = hotspotAchangBelly.querySelectorAll('.scene-hint-tag, .belly-tag');
      tags.forEach(t => { t.style.display = 'none'; });
    }
  }

  // 重置 0708 互動狀態（恢復紅色提示圈、還原初始指針位置）
  function reset0708Task() {
    stop0708Audio();
    is0708Running = false;
    is0708Completed = false;
    needleAngle0708 = -90.0;

    // 恢復指針平靜狀態（穩定指向左側水平藍色低壓端 -90 度）
    if (meterNeedle) {
      meterNeedle.setAttribute('transform', 'rotate(-90)');
    }

    // 真正重置回未開始狀態：重新顯示紅色提示圈與標籤
    if (scene0708InteractiveLayer) {
      scene0708InteractiveLayer.classList.remove('interaction-active');
    }
    if (hotspotAchangBelly) {
      hotspotAchangBelly.classList.remove('active-running', 'holding', 'completed');
      const halos = hotspotAchangBelly.querySelectorAll('.scene-hint-halo, .belly-halo');
      halos.forEach(h => {
        h.style.display = '';
        h.style.animation = '';
        h.style.opacity = '';
        h.style.visibility = '';
        h.style.border = '';
        h.style.boxShadow = '';
        h.style.background = '';
      });
      const tags = hotspotAchangBelly.querySelectorAll('.scene-hint-tag, .belly-tag');
      tags.forEach(t => {
        t.style.display = '';
        t.style.animation = '';
        t.style.opacity = '';
        t.style.visibility = '';
      });
    }

    // 清除視覺特效
    if (achangHeatGlow) {
      achangHeatGlow.classList.remove('heating');
      achangHeatGlow.style.opacity = '0';
    }
    if (steamLeftPuff && steamRightPuff) {
      steamLeftPuff.classList.remove('steaming');
      steamRightPuff.classList.remove('steaming');
    }
    if (comicBoilBubbleLeft && comicBoilBubbleRight) {
      comicBoilBubbleLeft.classList.remove('show');
      comicBoilBubbleRight.classList.remove('show');
    }
    if (comicOverloadBanner) {
      comicOverloadBanner.classList.remove('show');
    }
    if (continue0708Btn) {
      continue0708Btn.style.display = 'none';
    }

    if (task0708StatusIcon) task0708StatusIcon.textContent = '🧭';
    if (task0708GuideText) {
      task0708GuideText.textContent = '點擊阿鏘的儀表或肚子，觀察指針劇烈晃動與緊張變化！';
    }
  }

  // ==========================================================================
  // 9.5 故事 4/7 第四互動：阿鏘爆笑出糗、48 顆爆米花大爆發
  // ==========================================================================

  // 動態生成 48 顆具備獨立弧形軌跡、大小、旋轉與延遲的黃金爆米花粒子
  function createPopcornParticles() {
    if (!popcornParticlesContainer) return;
    popcornParticlesContainer.innerHTML = '';

    const TOTAL_POPCORN = 48;
    const popcornDefs = `
      <svg width="0" height="0" style="position:absolute;">
        <defs>
          <radialGradient id="pop-grad-0910" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="55%" stop-color="#fff5db"/>
            <stop offset="85%" stop-color="#fde49a"/>
            <stop offset="100%" stop-color="#f5c760"/>
          </radialGradient>
        </defs>
      </svg>
    `;
    popcornParticlesContainer.insertAdjacentHTML('beforeend', popcornDefs);

    for (let i = 0; i < TOTAL_POPCORN; i++) {
      const p = document.createElement('div');
      p.className = 'popcorn-particle';

      // 雙形狀微變異，增加自然生動感
      if (i % 2 === 0) {
        p.innerHTML = `
          <svg class="popcorn-svg" viewBox="0 0 32 32">
            <path d="M16 5 C11 5 8 9 10 14 C7 14 5 18 7 22 C9 26 14 26 16 24 C19 26 24 25 25 21 C27 17 25 13 22 13 C22 9 20 5 16 5 Z" fill="url(#pop-grad-0910)"/>
            <circle cx="15.5" cy="16.5" r="3.2" fill="#d4821c" opacity="0.8"/>
            <ellipse cx="14" cy="17.5" rx="2" ry="1.2" fill="#aa5e0b" opacity="0.6"/>
          </svg>
        `;
      } else {
        p.innerHTML = `
          <svg class="popcorn-svg" viewBox="0 0 32 32">
            <path d="M14 6 C9 7 7 12 10 16 C6 18 6 23 10 25 C14 27 18 25 19 23 C23 25 27 22 26 17 C25 12 21 12 20 14 C19 9 16 5 14 6 Z" fill="url(#pop-grad-0910)"/>
            <circle cx="16" cy="16" r="3.5" fill="#df891f" opacity="0.8"/>
            <ellipse cx="17.5" cy="15.5" rx="2.2" ry="1.4" fill="#9e5004" opacity="0.6"/>
          </svg>
        `;
      }

      // 起點精準位於電鍋開口 (Center X: 38.0%, Y: 37.5%)
      const startX = 38.0 + (Math.random() - 0.5) * 4.0;
      const startY = 37.5 + (Math.random() - 0.5) * 3.0;
      p.style.left = startX + '%';
      p.style.top = startY + '%';

      // 分三波噴射連發節奏：
      // 0~14顆：首波先鋒爆破 (0.05s ~ 0.25s)
      // 15~35顆：主高潮連環大噴發 (0.25s ~ 0.85s)
      // 36~47顆：尾聲零星跳躍 (0.85s ~ 1.55s)
      let delay;
      if (i < 15) {
        delay = 0.05 + Math.random() * 0.22;
      } else if (i < 36) {
        delay = 0.25 + Math.random() * 0.60;
      } else {
        delay = 0.85 + Math.random() * 0.70;
      }

      // 依序分流至三大地板落點區域（左右兩側與正前方草地，避開畫面中央與角色臉孔）
      let dx, dy, peakY;
      const group = i % 3; // 0: 左側草地, 1: 前方草地, 2: 右側草地

      if (group === 0) {
        // 左側草地與兔子、小松鼠旁 (X: ~10% ~ 32%)
        dx = -80 - Math.random() * 240; // -80px 到 -320px
        dy = (220 + Math.random() * 85) + 'px'; // +220px 到 +305px (落在地面草皮)
        if (i % 6 === 0) {
          peakY = (-160 - Math.random() * 50) + 'px'; // 少部分高空驚喜弧線 (天空留白區)
        } else {
          peakY = (-50 - Math.random() * 60) + 'px';
        }
      } else if (group === 1) {
        // 正前方與阿鏘、小宇腳邊底層草皮 (X: ~34% ~ 50%)
        dx = -50 + Math.random() * 140; // -50px 到 +90px
        dy = (240 + Math.random() * 75) + 'px'; // +240px 到 +315px (最底層草皮)
        peakY = (-30 - Math.random() * 60) + 'px'; // 低空向前滾落，完全不遮擋臉部與身體儀表
      } else {
        // 右側草地與河狸尾巴、小狐狸腳邊 (X: ~54% ~ 86%)
        dx = 140 + Math.random() * 290; // +140px 到 +430px
        dy = (220 + Math.random() * 85) + 'px'; // +220px 到 +305px (落在地面草皮)
        if (i % 6 === 2) {
          peakY = (-170 - Math.random() * 50) + 'px'; // 少部分高空驚喜弧線 (天空留白區)
        } else {
          peakY = (-60 - Math.random() * 60) + 'px';
        }
      }

      const rot = ((Math.random() - 0.5) * 720).toFixed(0) + 'deg';
      const scale = (0.75 + Math.random() * 0.45).toFixed(2);
      const dur = (1.5 + Math.random() * 0.6).toFixed(2) + 's';
      const bounceX = (Math.random() > 0.5 ? 4 : -4) + 'px';
      const bounceY = (4 + Math.random() * 6).toFixed(1) + 'px';

      p.style.setProperty('--dx', dx.toFixed(1) + 'px');
      p.style.setProperty('--dy', dy);
      p.style.setProperty('--peak-y', peakY);
      p.style.setProperty('--rot', rot);
      p.style.setProperty('--scale', scale);
      p.style.setProperty('--dur', dur);
      p.style.setProperty('--delay', delay.toFixed(2) + 's');
      p.style.setProperty('--bounce-x', bounceX);
      p.style.setProperty('--bounce-y', bounceY);

      popcornParticlesContainer.appendChild(p);
    }
  }

  // 停止 0910 爆米花專用音效與動畫計時器
  function stop0910Audio() {
    popcornAnimTimeouts.forEach(t => clearTimeout(t));
    popcornAnimTimeouts = [];
    clearInterval(popcornFadeInterval);
    popcornFadeInterval = null;

    try {
      audioPopcorn.pause();
      audioPopcorn.currentTime = 0;
      audioCooker.pause();
      audioCooker.currentTime = 0;
    } catch (e) {}

    if (!isNarrationPlaying) duckBgm(false);

    if (scene0910VisualBox) {
      scene0910VisualBox.classList.remove('rumble-shake');
    }
  }

  // 點擊啟動 0910 互動（蓄力震動、鍋蓋彈跳、48顆爆米花大爆發）
  function start0910Interaction() {
    unlockAudio();
    if (is0910Running || is0910Completed) return;
    is0910Running = true;

    // 1. 立即隱藏額外提示圈、標籤與多餘裝飾光暈（按鈕本體完好保留）
    if (scene0910InteractiveLayer) {
      scene0910InteractiveLayer.classList.add('interaction-active');
    }
    if (hotspotAchangCooker) {
      hotspotAchangCooker.classList.add('active-running');
      try { hotspotAchangCooker.blur(); } catch (e) {}
      const halos = hotspotAchangCooker.querySelectorAll('.scene-hint-halo, .cooker-halo');
      halos.forEach(h => {
        h.style.display = 'none';
        h.style.animation = 'none';
        h.style.opacity = '0';
        h.style.visibility = 'hidden';
        h.style.boxShadow = 'none';
        h.style.border = 'none';
        h.style.background = 'transparent';
      });
      const tags = hotspotAchangCooker.querySelectorAll('.scene-hint-tag, .cooker-tag');
      tags.forEach(t => {
        t.style.display = 'none';
        t.style.animation = 'none';
        t.style.opacity = '0';
        t.style.visibility = 'hidden';
      });
    }
    if (achangPopcornGlow) {
      achangPopcornGlow.classList.remove('charging');
      achangPopcornGlow.style.display = 'none';
      achangPopcornGlow.style.opacity = '0';
    }

    // 2. 階段一：阿鏘短暫蓄力機身微幅震動 (0 ~ 380ms)
    if (scene0910VisualBox) {
      scene0910VisualBox.classList.add('rumble-shake');
    }

    // 更新任務提示引導
    if (task0910StatusIcon) task0910StatusIcon.textContent = '⚡';
    if (task0910GuideText) {
      task0910GuideText.textContent = '阿鏘肚子劇烈震動蓄力中，電鍋就要彈開了……';
    }

    // 3. 階段二：電鍋蓋彈跳 + 48顆爆米花大爆發 (380ms)
    const tPop = setTimeout(() => {
      if (!is0910Running) return;

      if (scene0910VisualBox) {
        scene0910VisualBox.classList.remove('rumble-shake');
      }

      // 播放金屬電鍋彈跳聲
      try {
        audioCooker.volume = userNarrationVolume;
        audioCooker.currentTime = 0;
        audioCooker.play().catch(() => {});
      } catch (e) {}

      // 播放爆米花連環爆炸聲並避讓背景音樂
      try {
        audioPopcorn.volume = userNarrationVolume * 0.95;
        audioPopcorn.currentTime = 0;
        audioPopcorn.play().catch(() => {});
        duckBgm(true);
      } catch (e) {}

      // 觸發鍋蓋彈跳拋擲
      if (cookerLidJump) {
        cookerLidJump.classList.remove('popping');
        void cookerLidJump.offsetWidth; // 強制重繪
        cookerLidJump.classList.add('popping');
      }

      // 觸發白煙膨脹散開
      if (popcornSteamBurst) {
        popcornSteamBurst.classList.remove('bursting');
        void popcornSteamBurst.offsetWidth;
        popcornSteamBurst.classList.add('bursting');
      }

      // 噴射 48 顆爆米花粒子
      createPopcornParticles();

      if (task0910StatusIcon) task0910StatusIcon.textContent = '💥';
      if (task0910GuideText) {
        task0910GuideText.textContent = '「鏘——！」48 顆爆米花像下雨一樣大噴發！';
      }
    }, 380);
    popcornAnimTimeouts.push(tPop);

    // 4. 階段三：爆發收尾、音效平滑淡出、狀態結算與解鎖下一頁 (3600ms)
    const tEnd = setTimeout(() => {
      if (!is0910Running) return;

      // 爆米花音效平滑淡出 500ms，杜絕無限制持續播放
      let fadeCount = 10;
      const startVol = audioPopcorn.volume;
      clearInterval(popcornFadeInterval);
      popcornFadeInterval = setInterval(() => {
        fadeCount--;
        if (fadeCount <= 0) {
          clearInterval(popcornFadeInterval);
          popcornFadeInterval = null;
          audioPopcorn.pause();
          audioPopcorn.currentTime = 0;
          if (!isNarrationPlaying) duckBgm(false);
        } else {
          try {
            audioPopcorn.volume = Math.max(0, startVol * (fadeCount / 10));
          } catch (e) {}
        }
      }, 50);

      is0910Running = false;
      is0910Completed = true;

      if (hotspotAchangCooker) {
        hotspotAchangCooker.classList.remove('active-running');
        hotspotAchangCooker.classList.add('completed');
        const halo = hotspotAchangCooker.querySelector('.scene-hint-halo, .cooker-halo');
        if (halo) halo.style.display = 'none';
        const tag = hotspotAchangCooker.querySelector('.scene-hint-tag, .cooker-tag');
        if (tag) tag.style.display = 'none';
      }

      // 任務回饋文字更新
      if (task0910StatusIcon) task0910StatusIcon.textContent = '✨';
      if (task0910GuideText) {
        task0910GuideText.textContent = '爆米花落滿地！小宇笑著輕輕抱住阿鏘：「沒關係，你只是太緊張了！」';
      }

      // 解鎖繼續閱讀按鈕與重播按鈕
      if (continue0910Btn) {
        continue0910Btn.style.display = 'inline-flex';
      }
      if (reset0910Btn) {
        reset0910Btn.style.display = 'inline-flex';
      }

      // 解鎖底部下一頁按鈕
      if (currentPageIndex === 5) {
        nextBtn.disabled = false;
        nextBtn.title = '下一頁';
      }
    }, 3600);
    popcornAnimTimeouts.push(tEnd);
  }

  // 重置 0910 互動狀態（恢復提示圈、清除爆米花粒子、重置音訊）
  function reset0910Task() {
    stop0910Audio();
    is0910Running = false;
    is0910Completed = false;

    // 清除視覺特效與爆米花粒子
    if (popcornParticlesContainer) {
      popcornParticlesContainer.innerHTML = '';
    }
    if (cookerLidJump) {
      cookerLidJump.classList.remove('popping');
    }
    if (popcornSteamBurst) {
      popcornSteamBurst.classList.remove('bursting');
    }
    if (achangPopcornGlow) {
      achangPopcornGlow.classList.remove('charging');
    }
    if (scene0910InteractiveLayer) {
      scene0910InteractiveLayer.classList.remove('interaction-active');
    }
    if (hotspotAchangCooker) {
      hotspotAchangCooker.classList.remove('active-running', 'completed');
      const halos = hotspotAchangCooker.querySelectorAll('.scene-hint-halo, .cooker-halo');
      halos.forEach(h => {
        h.style.display = '';
        h.style.animation = '';
        h.style.opacity = '';
        h.style.visibility = '';
        h.style.border = '';
        h.style.boxShadow = '';
        h.style.background = '';
      });
      const tags = hotspotAchangCooker.querySelectorAll('.scene-hint-tag, .cooker-tag');
      tags.forEach(t => {
        t.style.display = '';
        t.style.animation = '';
        t.style.opacity = '';
        t.style.visibility = '';
      });
    }

    // 恢復任務導引提示文字
    if (task0910StatusIcon) task0910StatusIcon.textContent = '🍿';
    if (task0910GuideText) {
      task0910GuideText.textContent = '點擊阿鏘的電鍋開關，觸發爆米花大爆發！';
    }

    // 隱藏重播按鈕與繼續按鈕
    if (reset0910Btn) {
      reset0910Btn.style.display = 'none';
    }
    if (continue0910Btn) {
      continue0910Btn.style.display = 'none';
    }
  }

  // ==========================================================================
  // 9. 故事 5/7 (1112 意外轉折) 第五互動：觀察情緒與情感陪伴
  // ==========================================================================
  const COMPANION_FEEDBACK = {
    'A': '有時候，願意聽朋友說說話，就是最溫暖的陪伴。',
    'B': '默默坐在朋友身邊陪伴，能給他滿滿的安全感。',
    'C': '先照顧情緒、等心情平靜再一起找方法，是很貼心的作法。'
  };

  function playWarmDingSound() {
    unlockAudio();
    try {
      const audio = new Audio(SOUND_EFFECTS.ding);
      audio.volume = userNarrationVolume * 0.8;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  function playSobbingSound() {
    if (hasPlayedSobbing) return;
    hasPlayedSobbing = true;
    try {
      audioSobbing.currentTime = 0;
      audioSobbing.volume = Math.min(1.0, userNarrationVolume * 0.7);
      audioSobbing.play().catch(() => {});
    } catch (e) {}
  }

  function stop1112Audio() {
    try {
      audioSobbing.pause();
      audioSobbing.currentTime = 0;
    } catch (e) {}
  }

  function observeExamPaper() {
    unlockAudio();
    isExamObserved = true;
    if (hotspotExamPaper) {
      hotspotExamPaper.classList.add('observed');
    }
    if (bubbleExam) {
      bubbleExam.style.display = 'block';
    }
    checkScene1112Progress();
  }

  function observeDabao() {
    unlockAudio();
    isDabaoObserved = true;
    playSobbingSound();
    if (hotspotDabaoCry) {
      hotspotDabaoCry.classList.add('observed');
    }
    if (bubbleDabao) {
      bubbleDabao.style.display = 'block';
    }
    checkScene1112Progress();
  }

  function observeFriends() {
    unlockAudio();
    isFriendsObserved = true;
    isAchangObserved = true;
    if (hotspotFriendsConcern) {
      hotspotFriendsConcern.classList.add('observed');
    }
    if (bubbleFriends) {
      bubbleFriends.style.display = 'block';
    }
    checkScene1112Progress();
  }

  function observeAchang() {
    observeFriends();
  }

  function checkScene1112Progress() {
    const count = (isExamObserved ? 1 : 0) + (isDabaoObserved ? 1 : 0) + (isFriendsObserved ? 1 : 0);
    if (count === 3) {
      if (stepIcon1112) stepIcon1112.textContent = '💡';
      if (guideText1112) guideText1112.textContent = '很好！你觀察到了考卷的分數、大寶的難過，以及小宇和阿鏘的關切反應。請在下方選擇你想如何陪伴他：';
      if (companionChoiceContainer) {
        companionChoiceContainer.style.display = 'block';
        try {
          companionChoiceContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {}
      }
    } else if (isExamObserved && isDabaoObserved) {
      if (stepIcon1112) stepIcon1112.textContent = '💡';
      if (guideText1112) guideText1112.textContent = '很好！你觀察到了考卷的分數與大寶的失落。也看看右側「小宇和阿鏘」的反應吧！請在下方選擇你想如何陪伴他：';
      if (companionChoiceContainer) {
        companionChoiceContainer.style.display = 'block';
        try {
          companionChoiceContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {}
      }
    } else {
      const missing = [];
      if (!isExamObserved) missing.push('「分數」');
      if (!isDabaoObserved) missing.push('「大寶」');
      if (!isFriendsObserved) missing.push('「小宇和阿鏘」');
      if (guideText1112) {
        guideText1112.textContent = `已開始觀察！請接著點擊畫面中的 ${missing.join('、')}...`;
      }
    }
  }

  function selectCompanionChoice(choiceKey) {
    unlockAudio();
    selectedCompanionChoice = choiceKey;

    companionBtns.forEach(btn => {
      if (btn.dataset.choice === choiceKey) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });

    if (choiceFeedbackBox && feedbackText) {
      choiceFeedbackBox.style.display = 'flex';
      feedbackText.textContent = COMPANION_FEEDBACK[choiceKey] || '';
      try {
        choiceFeedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (e) {}
    }

    playWarmDingSound();
    is1112Completed = true;

    if (stepIcon1112) stepIcon1112.textContent = '🌟';
    if (guideText1112) guideText1112.textContent = '溫暖的陪伴已送達！你已解鎖下一頁。';

    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.title = '下一頁';
    }
  }

  function reset1112Interaction() {
    stop1112Audio();
    isExamObserved = false;
    isDabaoObserved = false;
    isAchangObserved = false;
    isFriendsObserved = false;
    selectedCompanionChoice = null;
    is1112Completed = false;
    hasPlayedSobbing = false;

    if (hotspotExamPaper) hotspotExamPaper.classList.remove('observed');
    if (hotspotDabaoCry) hotspotDabaoCry.classList.remove('observed');
    if (hotspotFriendsConcern) hotspotFriendsConcern.classList.remove('observed');
    if (hotspotAchangConcern) hotspotAchangConcern.classList.remove('observed');

    if (bubbleExam) bubbleExam.style.display = 'none';
    if (bubbleDabao) bubbleDabao.style.display = 'none';
    if (bubbleFriends) bubbleFriends.style.display = 'none';
    if (bubbleAchang) bubbleAchang.style.display = 'none';

    if (companionChoiceContainer) companionChoiceContainer.style.display = 'none';
    if (choiceFeedbackBox) choiceFeedbackBox.style.display = 'none';

    companionBtns.forEach(btn => btn.classList.remove('selected'));

    if (stepIcon1112) stepIcon1112.textContent = '🔍';
    if (guideText1112) guideText1112.textContent = '請點擊畫面中的「分數」、「大寶」與「小宇和阿鏘」進行觀察...';
  }

  function autostart1112Interaction() {
    observeExamPaper();
    setTimeout(() => {
      observeDabao();
      setTimeout(() => {
        observeAchang();
        setTimeout(() => {
          selectCompanionChoice('A');
        }, 300);
      }, 200);
    }, 200);
  }

  // 暴露全域除錯與自動測試介面
  window.observeExamPaper = observeExamPaper;
  window.observeDabao = observeDabao;
  window.observeFriends = observeFriends;
  window.observeAchang = observeFriends;
  window.selectCompanionChoice = selectCompanionChoice;
  window.reset1112Interaction = reset1112Interaction;
  window.autostart1112Interaction = autostart1112Interaction;

  // ==========================================================================
  // 9.6 故事 6/7 (1314 高潮與主動化解) 第六互動：主動化解與棉花糖魔法
  // ==========================================================================

  function stop1314Audio() {
    audioDing.pause();
    audioDing.currentTime = 0;
    audioMarshmallow.pause();
    audioMarshmallow.currentTime = 0;
    stopMarshmallowParticles();
    marshmallowAnimTimeouts.forEach(t => clearTimeout(t));
    marshmallowAnimTimeouts = [];
  }

  // 棉花糖魔法彩色糖粉、星星與音符粒子動畫 (Canvas)
  function startMarshmallowParticles() {
    if (!marshmallowCanvas) return;
    const ctx = marshmallowCanvas.getContext('2d');
    if (!ctx) return;

    // 自適應視覺畫布實際尺寸
    const rect = marshmallowCanvas.getBoundingClientRect();
    const width = rect.width || 1200;
    const height = rect.height || (width * 9 / 16);
    marshmallowCanvas.width = width;
    marshmallowCanvas.height = height;

    marshmallowParticles = [];
    const colors = [
      'rgba(255, 182, 193, 0.85)', // 柔和粉紅
      'rgba(255, 209, 220, 0.85)', // 櫻花粉
      'rgba(255, 249, 166, 0.90)', // 溫暖柔黃
      'rgba(255, 224, 130, 0.85)', // 蜂蜜金
      'rgba(179, 229, 252, 0.85)', // 棉花糖天藍
      'rgba(225, 190, 231, 0.85)', // 夢幻淡紫
      'rgba(255, 255, 255, 0.95)'  // 純潔星光白
    ];

    const types = ['circle', 'circle', 'circle', 'star', 'star', 'note', 'heart'];

    // 鍋口噴發點：X=47%, Y=54%
    const originX = width * 0.47;
    const originY = height * 0.54;

    // 預先生成一批種子粒子
    for (let i = 0; i < 35; i++) {
      spawnParticle(true);
    }

    let spawnCounter = 0;

    function spawnParticle(isInitial = false) {
      const type = types[Math.floor(Math.random() * types.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const p = {
        x: originX + (Math.random() - 0.5) * (width * 0.05),
        y: isInitial ? (originY - Math.random() * (height * 0.28)) : (originY + (Math.random() - 0.5) * 10),
        vx: (Math.random() - 0.52) * 1.2, // 略微往左上棉花糖中心漂移
        vy: -(0.9 + Math.random() * 1.4),  // 向上冉冉升起
        size: type === 'circle' ? (3 + Math.random() * 4.5) : (10 + Math.random() * 8),
        color: color,
        type: type,
        alpha: 0.2 + Math.random() * 0.75,
        fadeSpeed: 0.004 + Math.random() * 0.006,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.05,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.04
      };
      marshmallowParticles.push(p);
    }

    function renderFrame() {
      ctx.clearRect(0, 0, width, height);

      // 持續生成新糖粉粒子
      spawnCounter++;
      if (spawnCounter % 3 === 0 && marshmallowParticles.length < 65) {
        spawnParticle(false);
      }

      for (let i = marshmallowParticles.length - 1; i >= 0; i--) {
        const p = marshmallowParticles[i];
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.6;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha -= p.fadeSpeed;

        // 當粒子升得太高或淡出時重置或移除
        if (p.alpha <= 0 || p.y < height * 0.12) {
          marshmallowParticles.splice(i, 1);
          continue;
        }

        // 安全防護：約束在中間魔法天空範圍，不遮擋兩側主角臉部
        if (p.x < width * 0.35 || p.x > width * 0.62) {
          p.alpha -= 0.02; // 加速淡出
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.type === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
        } else if (p.type === 'star') {
          // 四角星光
          ctx.beginPath();
          const r = p.size;
          ctx.moveTo(0, -r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.quadraticCurveTo(0, 0, 0, r);
          ctx.quadraticCurveTo(0, 0, -r, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffffff';
          ctx.fill();
        } else if (p.type === 'note') {
          // 飄動小音符
          ctx.font = `bold ${p.size}px sans-serif`;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('♪', 0, 0);
        } else if (p.type === 'heart') {
          // 溫暖小愛心
          ctx.font = `bold ${p.size}px sans-serif`;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ff69b4';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💖', 0, 0);
        }

        ctx.restore();
      }

      marshmallowParticlesAnimId = requestAnimationFrame(renderFrame);
    }

    if (marshmallowParticlesAnimId) cancelAnimationFrame(marshmallowParticlesAnimId);
    marshmallowParticlesAnimId = requestAnimationFrame(renderFrame);
  }

  function stopMarshmallowParticles() {
    if (marshmallowParticlesAnimId) {
      cancelAnimationFrame(marshmallowParticlesAnimId);
      marshmallowParticlesAnimId = null;
    }
    if (marshmallowCanvas) {
      const ctx = marshmallowCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, marshmallowCanvas.width, marshmallowCanvas.height);
    }
    marshmallowParticles = [];
  }

  function start1314Interaction() {
    unlockAudio();
    if (is1314Running) return;

    is1314Running = true;

    // 1. 立即隱藏紅色虛線提示圈與標籤，按鈕本體完整保留
    if (scene1314Overlay) scene1314Overlay.classList.add('interaction-active');
    if (hotspotAchangHeart) hotspotAchangHeart.classList.add('active-running');

    // 2. 階段一 (0ms)：阿鏘胸前亮起暖金光芒，伴隨清脆溫暖叮聲
    if (achangHeartGlow) achangHeartGlow.classList.add('active');
    if (stepIcon1314) stepIcon1314.textContent = '🌟';
    if (guideText1314) guideText1314.textContent = '阿鏘胸前亮起溫暖金光，發出一聲清脆的「叮」……';

    audioDing.currentTime = 0;
    audioDing.volume = userNarrationVolume * 0.85;
    audioDing.play().catch(e => console.log('Audio ding playback hint:', e));

    // 3. 階段二 (800ms)：鍋口彩虹糖粉光霧升騰、空中棉花糖微光浮動、Canvas 彩色糖粉與星光流動
    const t1 = setTimeout(() => {
      if (magicStreamSvg) magicStreamSvg.classList.add('active');
      if (marshmallowMagicAura) marshmallowMagicAura.classList.add('active');
      startMarshmallowParticles();

      audioMarshmallow.currentTime = 0;
      audioMarshmallow.volume = userNarrationVolume * 0.8;
      audioMarshmallow.play().catch(e => console.log('Audio marshmallow playback hint:', e));

      if (guideText1314) guideText1314.textContent = '彩色糖粉與魔法升起，一朵大大的笑臉棉花糖飄了出來！大寶笑了！';
    }, 800);
    marshmallowAnimTimeouts.push(t1);

    // 4. 階段三 (4000ms)：魔法動畫圓滿達成，展現故事回饋卡與「重新觀看 ↺」按鈕，解鎖下一頁
    const t2 = setTimeout(() => {
      is1314Running = false;
      is1314Completed = true;

      if (hotspotAchangHeart) {
        hotspotAchangHeart.classList.remove('active-running');
        hotspotAchangHeart.classList.add('completed');
      }

      if (reset1314Btn) reset1314Btn.style.display = 'inline-flex';
      if (warmthFeedbackBox) {
        warmthFeedbackBox.style.display = 'flex';
        try {
          warmthFeedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {}
      }

      if (stepIcon1314) stepIcon1314.textContent = '💖';
      if (guideText1314) guideText1314.textContent = '棉花糖魔法已化解大寶的難過！你已解鎖下一頁。';

      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.title = '下一頁';
      }
    }, 4000);
    marshmallowAnimTimeouts.push(t2);
  }

  function reset1314Interaction() {
    stop1314Audio();
    is1314Running = false;
    is1314Completed = false;

    // 恢復提示圈與按鈕初始狀態
    if (scene1314Overlay) scene1314Overlay.classList.remove('interaction-active');
    if (hotspotAchangHeart) {
      hotspotAchangHeart.classList.remove('active-running', 'completed');
    }

    // 關閉光暈與動畫圖層
    if (achangHeartGlow) achangHeartGlow.classList.remove('active');
    if (magicStreamSvg) magicStreamSvg.classList.remove('active');
    if (marshmallowMagicAura) marshmallowMagicAura.classList.remove('active');
    stopMarshmallowParticles();

    // 隱藏回饋與重置按鈕
    if (reset1314Btn) reset1314Btn.style.display = 'none';
    if (warmthFeedbackBox) warmthFeedbackBox.style.display = 'none';

    // 恢復任務導引文字
    if (stepIcon1314) stepIcon1314.textContent = '✨';
    if (guideText1314) guideText1314.textContent = '小宇走上前，牽著阿鏘……請點擊阿鏘肚子上的紅色開關，啟動暖心魔法！';
  }

  // 暴露全域除錯與自動測試介面
  window.start1314Interaction = start1314Interaction;
  window.reset1314Interaction = reset1314Interaction;

  // ==========================================================================
  // 9.7 故事 7/7 (1516 收尾共鳴) 第七互動：收尾共鳴・溫暖自由探索
  // ==========================================================================

  function stop1516Audio() {
    if (bubbleCupcakes) bubbleCupcakes.style.display = 'none';
    if (bubbleDabao1516) bubbleDabao1516.style.display = 'none';
    if (bubbleHands1516) bubbleHands1516.style.display = 'none';
    if (bubbleFriends1516) bubbleFriends1516.style.display = 'none';
  }

  function exploreCupcakes() {
    unlockAudio();
    isCupcakesExplored = true;
    if (hotspotCupcakes) hotspotCupcakes.classList.add('observed');
    if (cupcakeWarmGlow) cupcakeWarmGlow.classList.add('active');
    if (bubbleCupcakes) bubbleCupcakes.style.display = 'block';
    playWarmDingSound();
    if (stepIcon1516) stepIcon1516.textContent = '🧁';
    if (guideText1516) guideText1516.textContent = '阿鏘端出剛出爐的小巧彩色蛋糕，冒著香甜熱氣，溫暖了大家……';
    if (reset1516Btn) reset1516Btn.style.display = 'inline-flex';
  }

  function exploreDabao1516() {
    unlockAudio();
    isDabao1516Explored = true;
    if (hotspotDabaoSmile) hotspotDabaoSmile.classList.add('observed');
    if (bubbleDabao1516) bubbleDabao1516.style.display = 'block';
    playWarmDingSound();
    if (stepIcon1516) stepIcon1516.textContent = '🍯';
    if (guideText1516) guideText1516.textContent = '大寶吸吸鼻子，笑著說這是最棒的 58 分安慰點心！';
    if (reset1516Btn) reset1516Btn.style.display = 'inline-flex';
  }

  function exploreHands1516() {
    unlockAudio();
    isHands1516Explored = true;
    if (hotspotHandsTogether) hotspotHandsTogether.classList.add('observed');
    if (bubbleHands1516) bubbleHands1516.style.display = 'block';
    playWarmDingSound();
    if (stepIcon1516) stepIcon1516.textContent = '🤝';
    if (guideText1516) guideText1516.textContent = '小宇握緊阿鏘的手：我們都有屬於自己的特別超能力！';
    if (reset1516Btn) reset1516Btn.style.display = 'inline-flex';
  }

  function exploreFriends1516() {
    unlockAudio();
    isFriends1516Explored = true;
    if (hotspotMoXuangguang) hotspotMoXuangguang.classList.add('observed');
    if (hotspotXiaomo) hotspotXiaomo.classList.add('observed');
    if (friendsTagShared) friendsTagShared.classList.add('observed');
    if (bubbleFriends1516) bubbleFriends1516.style.display = 'block';
    playWarmDingSound();
    if (stepIcon1516) stepIcon1516.textContent = '✨';
    if (guideText1516) guideText1516.textContent = '炫光號螢幕跳出大大的笑臉，小莫也開心地笑著！';
    if (reset1516Btn) reset1516Btn.style.display = 'inline-flex';
  }

  function reset1516Interaction() {
    isCupcakesExplored = false;
    isDabao1516Explored = false;
    isHands1516Explored = false;
    isFriends1516Explored = false;

    if (hotspotCupcakes) hotspotCupcakes.classList.remove('observed');
    if (hotspotDabaoSmile) hotspotDabaoSmile.classList.remove('observed');
    if (hotspotHandsTogether) hotspotHandsTogether.classList.remove('observed');
    if (hotspotMoXuangguang) hotspotMoXuangguang.classList.remove('observed');
    if (hotspotXiaomo) hotspotXiaomo.classList.remove('observed');
    if (friendsTagShared) friendsTagShared.classList.remove('observed');

    if (cupcakeWarmGlow) cupcakeWarmGlow.classList.remove('active');

    if (bubbleCupcakes) bubbleCupcakes.style.display = 'none';
    if (bubbleDabao1516) bubbleDabao1516.style.display = 'none';
    if (bubbleHands1516) bubbleHands1516.style.display = 'none';
    if (bubbleFriends1516) bubbleFriends1516.style.display = 'none';

    if (reset1516Btn) reset1516Btn.style.display = 'none';

    if (stepIcon1516) stepIcon1516.textContent = '🌅';
    if (guideText1516) guideText1516.textContent = '夕陽灑在森林裡……點擊畫面中的角色或小蛋糕，感受大家溫暖的友誼～';
  }

  // 暴露全域除錯與自動測試介面
  window.exploreCupcakes = exploreCupcakes;
  window.exploreDabao1516 = exploreDabao1516;
  window.exploreHands1516 = exploreHands1516;
  window.exploreFriends1516 = exploreFriends1516;
  window.reset1516Interaction = reset1516Interaction;

  // ==========================================================================
  // 10. 事件綁定 (UI Controls & Keyboards)
  // ==========================================================================
  function bindEvents() {
    // 扉頁互動熱區與按鈕監聽
    if (hotspotSpring) hotspotSpring.addEventListener('click', findSpring);
    if (hotspotWrench) hotspotWrench.addEventListener('click', findWrench);
    if (resetFlyleafBtn) resetFlyleafBtn.addEventListener('click', resetFlyleafTask);

    // 故事 2/7 互動熱區與按鈕監聽
    if (hotspotWire) hotspotWire.addEventListener('click', connectWire);
    if (hotspotRedButton) hotspotRedButton.addEventListener('click', pressRedButton);
    if (reset0506Btn) reset0506Btn.addEventListener('click', reset0506Task);
    if (continue0506Btn) {
      continue0506Btn.addEventListener('click', () => {
        unlockAudio();
        goToPage(4); // 進入 Scene 4 (故事 3/7)
      });
    }

    // 故事 3/7 互動熱區與按鈕監聽 (阿鏘緊張水滾與指針爆表)
    if (meterGaugeBox) {
      meterGaugeBox.addEventListener('click', start0708Interaction);
      meterGaugeBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          start0708Interaction();
        }
      });
    }

    if (hotspotAchangBelly) {
      hotspotAchangBelly.addEventListener('click', start0708Interaction);
      hotspotAchangBelly.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          start0708Interaction();
        }
      });
    }

    if (reset0708Btn) reset0708Btn.addEventListener('click', reset0708Task);
    if (continue0708Btn) {
      continue0708Btn.addEventListener('click', () => {
        unlockAudio();
        goToPage(5); // 進入 Scene 5 (故事 4/7, 0910爆笑出糗)
      });
    }

    // 故事 4/7 互動熱區與按鈕監聽 (阿鏘爆米花大爆發)
    if (hotspotAchangCooker) {
      hotspotAchangCooker.addEventListener('click', start0910Interaction);
      hotspotAchangCooker.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          start0910Interaction();
        }
      });
    }

    if (reset0910Btn) reset0910Btn.addEventListener('click', reset0910Task);
    if (continue0910Btn) {
      continue0910Btn.addEventListener('click', () => {
        unlockAudio();
        goToPage(6); // 進入 Scene 6 (故事 5/7, 1112意外轉折)
      });
    }

    // 故事 5/7 互動熱區與按鈕監聽 (考卷、大寶、阿鏘、陪伴選擇)
    if (hotspotExamPaper) hotspotExamPaper.addEventListener('click', observeExamPaper);
    if (hotspotDabaoCry) hotspotDabaoCry.addEventListener('click', observeDabao);
    if (hotspotAchangConcern) hotspotAchangConcern.addEventListener('click', observeAchang);
    if (reset1112Btn) reset1112Btn.addEventListener('click', reset1112Interaction);

    companionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = btn.dataset.choice;
        selectCompanionChoice(choice);
      });
    });

    bubbleCloseBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = btn.dataset.target;
        const targetBubble = document.getElementById(targetId);
        if (targetBubble) targetBubble.style.display = 'none';
      });
    });

    // 故事 6/7 互動熱區與按鈕監聽 (阿鏘暖心開關與棉花糖魔法)
    if (hotspotAchangHeart) {
      hotspotAchangHeart.addEventListener('click', start1314Interaction);
      hotspotAchangHeart.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          start1314Interaction();
        }
      });
    }
    if (reset1314Btn) {
      reset1314Btn.addEventListener('click', reset1314Interaction);
    }

    // 故事 7/7 互動熱區與按鈕監聽 (收尾共鳴・溫暖自由探索)
    if (hotspotCupcakes) hotspotCupcakes.addEventListener('click', exploreCupcakes);
    if (hotspotDabaoSmile) hotspotDabaoSmile.addEventListener('click', exploreDabao1516);
    if (hotspotHandsTogether) hotspotHandsTogether.addEventListener('click', exploreHands1516);
    if (hotspotMoXuangguang) hotspotMoXuangguang.addEventListener('click', exploreFriends1516);
    if (hotspotXiaomo) hotspotXiaomo.addEventListener('click', exploreFriends1516);
    if (friendsTagShared) friendsTagShared.addEventListener('click', exploreFriends1516);
    if (reset1516Btn) reset1516Btn.addEventListener('click', reset1516Interaction);

    // 故事討論卡片折疊切換
    discussionToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.closest('.discussion-panel');
        if (!panel) return;
        const isExpanded = panel.classList.toggle('expanded');
        btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      });
    });

    // 翻頁導覽按鈕
    prevBtn.addEventListener('click', prevPage);
    nextBtn.addEventListener('click', nextPage);
    homeBtn.addEventListener('click', () => {
      unlockAudio();
      goToPage(0);
    });

    // 封面「開始閱讀」按鈕
    startReadingBtn.addEventListener('click', () => {
      unlockAudio();
      startBgm();
      goToPage(1); // 進入扉頁
    });

    // 扉頁「進入故事」按鈕
    enterStoryBtn.addEventListener('click', () => {
      unlockAudio();
      if (!isBgmEnabled) startBgm();
      goToPage(2); // 進入故事 1/7
    });

    // 結語頁「重新閱讀」按鈕
    restartBtn.addEventListener('click', () => {
      unlockAudio();
      goToPage(0);
    });

    // 背景音樂控制按鈕 (頂部原本的音樂按鈕)
    bgmToggleBtn.addEventListener('click', toggleBgm);

    bgmVolSlider.addEventListener('input', (e) => {
      userBgmVolume = parseFloat(e.target.value);
      bgmAudio.volume = isNarrationPlaying ? userBgmVolume * 0.25 : userBgmVolume;
      if (userBgmVolume === 0) {
        updateBgmUiState(false);
      } else if (isBgmEnabled) {
        updateBgmUiState(true);
      }
    });

    // 旁白控制按鈕
    narrationPlayBtn.addEventListener('click', toggleNarration);
    narrationReplayBtn.addEventListener('click', replayNarration);
    narrationVolSlider.addEventListener('input', (e) => {
      userNarrationVolume = parseFloat(e.target.value);
      narrationAudio.volume = userNarrationVolume;
    });

    // 語速切換按鈕組 (0.8x, 1.0x, 1.2x)
    speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = btn.dataset.speed;
        setPlaybackRate(speed);
      });
    });

    // 自動朗讀切換監聽 (當取消勾選時，若當前正在播放旁白，立刻暫停)
    autoNarrationChk.addEventListener('change', (e) => {
      if (!e.target.checked) {
        if (isNarrationPlaying || !narrationAudio.paused) {
          pauseNarration();
        }
      }
    });

    // 旁白播放結束監聽
    narrationAudio.addEventListener('ended', () => {
      isNarrationPlaying = false;
      narrationPlayBtn.classList.remove('active');
      narrationIcon.textContent = '🔊';
      duckBgm(false);
    });

    // 鍵盤左右鍵導覽支援
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        prevPage();
      } else if (e.key === ' ' && !['INPUT', 'BUTTON'].includes(e.target.tagName)) {
        // 空白鍵切換旁白播放/暫停
        e.preventDefault();
        toggleNarration();
      }
    });
  }

  // 啟動執行
  init();
});