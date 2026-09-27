'use strict';
// No analytics, external requests, account collection, or server-side storage.
(() => {
  const $ = id => document.getElementById(id);
  const pageURL = 'https://larryveryhandsome.github.io/web-design/startup-failure/';
  const money = n => new Intl.NumberFormat('zh-TW', {maximumFractionDigits: 2}).format(n);
  const count = n => new Intl.NumberFormat('zh-TW', {maximumFractionDigits: 0}).format(n);
  const months = n => n > 0 && n < 0.1 ? '少於 0.1 個月' : '約 ' + new Intl.NumberFormat('zh-TW', {maximumFractionDigits: 1}).format(n) + ' 個月';
  let toastTimer;
  function toast(message) {
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4000);
  }
  function readNumbers(form, ids) {
    if (!form.checkValidity()) return null;
    const nums = ids.map(id => Number($(id).value));
    return nums.every(n => Number.isFinite(n) && n >= 0) ? nums : null;
  }
  function breakEven() {
    const numbers = readNumbers($('beForm'), ['fixed', 'price', 'variable', 'capacity', 'orders']);
    if (!numbers) {
      $('beResult').innerHTML = '<p class="calc-error">請完整填入有效的非負數字；交付單量須為整數，金額不得超過欄位上限。</p>';
      return;
    }
    const [fixed, price, variable, capacity, orders] = numbers;
    if (orders > capacity) {
      $('beResult').innerHTML = '<p class="calc-error">預計完成的訂單超過交付容量。請先調整交付量，或重新估算擴充產能後的成本，避免把做不完的訂單當收入。</p>';
      return;
    }
    const margin = price - variable;
    const maxResult = margin * capacity - fixed;
    const expectedResult = margin * orders - fixed;
    let main, message;
    if (margin > 0) {
      const needed = Math.ceil(fixed / margin);
      main = count(needed) + ' 單';
      if (needed > capacity) message = '目前價格與成本下，即使滿載也無法打平。需要調整售價、成本或可交付容量，不只是增加曝光。';
      else if (orders < needed) message = '容量容許打平，但目前預計交付量還不足。這也不代表市場一定能提供所需訂單。';
      else message = '以填入成本計算，預計交付量已達打平門檻；仍須檢查漏列成本、需求與實際收款時點。';
    } else if (margin === 0) {
      main = fixed > 0 ? '沒有可行單量' : '每單零貢獻';
      message = fixed > 0 ? '每單沒有貢獻，增加銷量無法支付固定成本。' : '固定成本與每單貢獻皆為零；這不產生餘額，也不證明任何報酬成立。';
    } else {
      main = '增加訂單無法改善';
      message = '每單變動成本高於售價，越接單越減少餘額。固定成本為零時，不接單可為零餘額，但接單仍會變差。';
    }
    $('beResult').innerHTML = '<div class="result-main"><span>每月打平門檻</span><strong>' + main + '</strong></div>' +
      '<div class="result-line"><span>每單貢獻</span><b>NT$ ' + money(margin) + '</b></div>' +
      '<div class="result-line"><span>滿載 ' + count(capacity) + ' 單後餘額</span><b>NT$ ' + money(maxResult) + '</b></div>' +
      '<div class="result-line"><span>預計 ' + count(orders) + ' 單後餘額</span><b>NT$ ' + money(expectedResult) + '</b></div>' +
      '<p class="calc-message">' + message + '</p>';
  }
  function cashFlow() {
    $('stressResult').textContent = '';
    const numbers = readNumbers($('cashForm'), ['cash', 'inflow', 'outflow']);
    if (!numbers) {
      $('cashResult').innerHTML = '<p class="calc-error">請完整填入有效的非負金額，且不得超過欄位上限。</p>';
      return;
    }
    const [cash, inflow, outflow] = numbers;
    const drain = outflow - inflow;
    const main = drain > 0 ? months(cash / drain) : '目前假設無淨流出';
    const description = drain > 0 ? '若每月收付不變、均勻發生，這是概略現金緩衝，不是企業剩餘壽命。' : '在這組每月總額假設下，不會因淨流出而耗盡現金；仍可能因付款早於收款而缺錢。';
    $('cashResult').innerHTML = '<div class="result-main"><span>概略現金緩衝</span><strong>' + main + '</strong></div>' +
      '<div class="result-line"><span>可用現金</span><b>NT$ ' + money(cash) + '</b></div>' +
      '<div class="result-line"><span>' + (drain >= 0 ? '每月淨流出' : '每月淨流入') + '</span><b>NT$ ' + money(Math.abs(drain)) + '</b></div>' +
      '<p class="calc-message">' + (cash === 0 ? '目前沒有現金存量緩衝，須逐筆檢查收付時點。' : '') + description + '</p>';
  }
  $('beForm').addEventListener('input', breakEven);
  $('cashForm').addEventListener('input', cashFlow);
  [$('beForm'), $('cashForm')].forEach(form => form.addEventListener('submit', event => event.preventDefault()));
  $('stressBtn').addEventListener('click', () => {
    const numbers = readNumbers($('cashForm'), ['cash', 'inflow', 'outflow']);
    if (!numbers) { $('stressResult').textContent = '請先填妥現金試算欄位。'; return; }
    const [cash, inflow, outflow] = numbers;
    const stressedInflow = inflow * 0.7;
    const drain = outflow - stressedInflow;
    $('stressResult').textContent = '假設每月實收降為 NT$ ' + money(stressedInflow) + '，實付仍為 NT$ ' + money(outflow) + '。' +
      (drain > 0 ? '每月淨流出 NT$ ' + money(drain) + '，概略緩衝為' + months(cash / drain) + '。' : '此情境仍無每月淨流出，但不保證日常收付時點沒有缺口。') + '此按鈕不改變原輸入值。';
  });
  breakEven(); cashFlow();
  const questions = [
    ['我能明確說出誰付款、誰決策，以及購買情境。', '不是只有年齡與地區，還知道這次購買為何發生。'],
    ['我有符合目前階段的需求證據，而不只得到稱讚。', '可為實際試單，或長週期業態的採購與技術里程碑。'],
    ['我知道客戶原本怎麼解決問題，為何要換成我。', '比較價格、時間、信任與切換成本，不只比較功能。'],
    ['每單增量成本、固定成本與老闆報酬有分開計算。', '沒有把無償工時誤認為現金支出，也沒有當成永久免費。'],
    ['我算過打平單量，且產能與需求假設可以核對。', '滿載都不能打平，就需要改模型，不只加廣告。'],
    ['我有按實際時點排列的收款與付款表。', '包含既有履約、稅費、必要生活提款與借款本息。'],
    ['下一笔重大支出有驗證目的，也有可承受上限。', '知道租約、設備、庫存或長約在退出時要付多少代價。'],
    ['合作人的角色、報酬、決策與退出方式已談清楚。', '分開出資、受僱、管理，不以親友關係取代備援。'],
    ['交付、修改、驗收、追加需求與維護範圍已明確。', '知道誰負責、客戶須配合什麼，以及追加如何計價。'],
    ['主要客戶、通路或關鍵人員中斷時，有替代安排。', '不要求零集中，而是知道中斷成本與接手方法。'],
    ['已核對業態及人員身分適用的登記、稅務與用人義務。', '需要時向主管機關或合格專業人士確認，不只看貼文。'],
    ['我有下一個決策日期與繼續、縮小、轉向、停止的條件。', '不是用過去投入的金額，證明下一笔支出一定值得。']
  ];
  const storeKey = 'tw-startup-failure-review-v1';
  const labels = {unknown: '還未查', evidence: '已有證據', gap: '待補強'};
  let answers = questions.map(() => 'unknown');
  let canStore = true;
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
    if (Array.isArray(saved) && saved.length === questions.length) answers = saved.map(v => Object.hasOwn(labels, v) ? v : 'unknown');
  } catch (_) { canStore = false; }
  questions.forEach(([question, hint], i) => {
    const row = document.createElement('div'); row.className = 'review-row';
    const num = document.createElement('span'); num.className = 'num'; num.textContent = String(i + 1).padStart(2, '0');
    const label = document.createElement('label'); label.htmlFor = 'review-' + i; label.append(document.createTextNode(question));
    const small = document.createElement('small'); small.id = 'review-hint-' + i; small.textContent = hint; label.append(small);
    const select = document.createElement('select'); select.id = 'review-' + i; select.setAttribute('aria-describedby', small.id);
    Object.entries(labels).forEach(([value, text]) => { const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option); });
    select.value = answers[i];
    select.addEventListener('change', () => { answers[i] = select.value; saveReview(); updateReview(); });
    row.append(num, label, select); $('reviewRows').append(row);
  });
  function saveReview() {
    try { localStorage.setItem(storeKey, JSON.stringify(answers)); canStore = true; }
    catch (_) { canStore = false; }
  }
  function updateReview() {
    const done = answers.filter(v => v === 'evidence').length;
    const gaps = answers.filter(v => v === 'gap').length;
    const unknown = answers.length - done - gaps;
    $('reviewCount').textContent = done + ' / 12 已有證據';
    $('reviewText').textContent = '另有 ' + gaps + ' 項待補強、' + unknown + ' 項還未查。這是查核狀態，不是成功率或危險等級。';
    $('reviewBar').style.width = (done / answers.length * 100) + '%';
    if (!canStore) $('storageNote').textContent = '目前瀏覽器無法儲存選項；本次仍可自查與匯出，但重新整理後可能不保留。資料不傳送伺服器。';
  }
  updateReview();
  $('resetBtn').addEventListener('click', () => {
    if (!window.confirm('只清除此頁在這個瀏覽器儲存的自查選項，確定嗎？')) return;
    answers = questions.map(() => 'unknown');
    answers.forEach((value, i) => { $('review-' + i).value = value; });
    try { localStorage.removeItem(storeKey); } catch (_) {}
    updateReview(); toast('此頁自查紀錄已清除。');
  });
  $('exportBtn').addEventListener('click', () => {
    const lines = ['創業失敗圖鑑｜我的經營自查', '匯出時間：' + new Date().toLocaleString('zh-TW'), '來源：' + pageURL, '本紀錄是自填狀態，不是經過驗證的風險評分。', ''];
    questions.forEach(([question, hint], i) => lines.push(String(i + 1).padStart(2, '0') + '. [' + labels[answers[i]] + '] ' + question, '    ' + hint, ''));
    lines.push('下一個要驗證的假設：', '驗證方法與預算上限：', '決策日期：', '繼續／縮小／轉向／停止的證據：');
    const url = URL.createObjectURL(new Blob(['\ufeff' + lines.join('\n')], {type: 'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = '創業經營自查紀錄.txt'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
  const sources = [...document.querySelectorAll('.source')];
  function filterSources(kind) {
    let visible = 0;
    sources.forEach(source => { const show = kind === 'all' || source.dataset.kind === kind; source.hidden = !show; if (show) visible++; });
    document.querySelectorAll('[data-filter]').forEach(button => { const active = button.dataset.filter === kind; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    $('sourceCount').textContent = '顯示 ' + visible + ' 個來源';
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => filterSources(button.dataset.filter)));
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#s"]');
    if (anchor && /^#s\d{2}$/.test(anchor.getAttribute('href'))) filterSources('all');
  });
  function revealSourceHash() {
    if (/^#s\d{2}$/.test(location.hash)) {
      filterSources('all');
      const target = document.getElementById(location.hash.slice(1));
      if (target) requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
    }
  }
  window.addEventListener('hashchange', revealSourceHash);
  revealSourceHash();
  const patterns = [...document.querySelectorAll('.pattern')];
  const updateExpand = () => { $('expandBtn').textContent = patterns.every(p => p.open) ? '收合全部' : '展開全部'; };
  $('expandBtn').addEventListener('click', () => { const open = !patterns.every(p => p.open); patterns.forEach(p => { p.open = open; }); updateExpand(); });
  patterns.forEach(p => p.addEventListener('toggle', updateExpand));
  let printStates = null;
  window.addEventListener('beforeprint', () => { if (!printStates) printStates = patterns.map(p => p.open); patterns.forEach(p => { p.open = true; }); });
  window.addEventListener('afterprint', () => { if (printStates) patterns.forEach((p, i) => { p.open = printStates[i]; }); printStates = null; updateExpand(); });
  $('printBtn').addEventListener('click', () => window.print());
  $('shareBtn').addEventListener('click', async () => {
    const data = {title: '創業失敗圖鑑｜台灣篇', text: '跨社群查核、14種失控模式、互動試算與來源連結。', url: pageURL};
    try {
      if (navigator.share) { await navigator.share(data); return; }
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(pageURL); toast('公開網址已複製，可貼到 LINE 或訊息。'); return; }
      window.prompt('複製此公開網址：', pageURL);
    } catch (error) { if (error.name !== 'AbortError') window.prompt('分享未完成，可複製此公開網址：', pageURL); }
  });
  let scheduled = false;
  function progress() {
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    $('readProgress').style.width = (scrollable > 0 ? Math.max(0, Math.min(100, scrollY / scrollable * 100)) : 0) + '%';
    scheduled = false;
  }
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(progress); } }, {passive: true});
  window.addEventListener('resize', progress); progress();
  if ('IntersectionObserver' in window) {
    const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) chapterLinks.forEach(a => a.classList.toggle('current', a.hash === '#' + entry.target.id)); });
    }, {rootMargin: '-150px 0px -65% 0px', threshold: 0});
    chapterLinks.forEach(a => { const target = document.querySelector(a.hash); if (target) observer.observe(target); });
  }
  // Typographic normalization only; never changes URLs, source IDs or entered data.
  const variants = {'选':'選','远':'遠','验':'驗','风':'風','险':'險','笔':'筆','续':'續','领':'領','与':'與','没':'沒','继':'繼','来':'來'};
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) if (!['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'OPTION'].includes(walker.currentNode.parentElement.tagName)) textNodes.push(walker.currentNode);
  textNodes.forEach(node => { node.nodeValue = node.nodeValue.replace(/[选远验风险笔续领与没继来]/g, c => variants[c]); });
})();
