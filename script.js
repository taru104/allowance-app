// ページの読み込みが終わったら実行
window.addEventListener('load', () => {
    // HTML要素の取得
    const balanceDisplay = document.getElementById('balance-display');
    const countdownDisplay = document.getElementById('countdown-display');
    const expenseAmountInput = document.getElementById('expense-amount');
    const spendButton = document.getElementById('spend-button');
    const resetButton = document.getElementById('reset-button');
    const editBalanceInput = document.getElementById('edit-balance-input');
    const editBalanceButton = document.getElementById('edit-balance-button');

    let currentBalance = 0;
    const today = new Date().toDateString();

    // --- 起動時の処理 ---
    initialize();

    // --- イベントリスナーの設定 ---
    // 「使った！」ボタン
    spendButton.addEventListener('click', () => {
        const amount = parseInt(expenseAmountInput.value, 10);
        if (isNaN(amount) || amount <= 0) {
            alert('正しい金額を入力してください。');
            return;
        }
        if (amount > currentBalance) {
            alert('残高が足りません！');
            return;
        }
        currentBalance -= amount;
        saveData(currentBalance);
        updateDisplay();
        expenseAmountInput.value = '';
    });

    // 「残高を更新」ボタン
    editBalanceButton.addEventListener('click', () => {
        const newBalance = parseInt(editBalanceInput.value, 10);
        if (isNaN(newBalance) || newBalance < 0) {
            alert('正しい金額を入力してください。');
            return;
        }
        if (confirm(`${newBalance.toLocaleString()}円に残高を変更しますか？`)) {
            currentBalance = newBalance;
            saveData(currentBalance);
            updateDisplay();
            editBalanceInput.value = '';
        }
    });

    // 「リセット」ボタン
    resetButton.addEventListener('click', () => {
        if (confirm('本当にデータをリセットして1000円に戻しますか？')) {
            localStorage.removeItem('okozukaiBalance');
            localStorage.removeItem('lastVisitDate');
            location.reload();
        }
    });
    
    // PWAのためのService Workerを登録
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.log('Service Worker not registered', err));
    }


    // --- 関数エリア ---
    // 初期化処理
    function initialize() {
        const savedBalance = localStorage.getItem('okozukaiBalance');
        const lastVisitDate = localStorage.getItem('lastVisitDate');

        if (savedBalance !== null) {
            currentBalance = parseInt(savedBalance, 10);
            if (lastVisitDate !== today) {
                const lastDate = new Date(lastVisitDate);
                const currentDate = new Date(today);
                const diffTime = currentDate - lastDate;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 0) {
                    currentBalance += diffDays * 1000;
                    alert(`${diffDays}日分のお小遣いとして${diffDays * 1000}円追加されました！`);
                }
            }
        } else {
            currentBalance = 1000;
            alert('ようこそ！最初のお小遣い1000円です！');
        }
        saveData(currentBalance);
        updateDisplay();
        startCountdown();
    }

    // 表示を更新する関数
    function updateDisplay() {
        balanceDisplay.textContent = `${currentBalance.toLocaleString()}円`;
    }

    // データを保存する関数
    function saveData(balance) {
        localStorage.setItem('okozukaiBalance', balance);
        localStorage.setItem('lastVisitDate', today);
    }

    // カウントダウンを開始する関数
    function startCountdown() {
        setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const diff = tomorrow - now;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            countdownDisplay.textContent = `あと ${hours}時間 ${minutes}分 ${seconds}秒`;
        }, 1000);
    }
});