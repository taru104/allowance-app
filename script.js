window.addEventListener('load', () => {
    // --- 要素の取得 ---
    const balanceDisplay = document.getElementById('balance-display');
    const feedbackMessage = document.getElementById('feedback-message');
    const itemNameInput = document.getElementById('item-name');
    const expenseAmountInput = document.getElementById('expense-amount');
    const spendButton = document.getElementById('spend-button');
    const historyList = document.getElementById('history-list');

    // --- データ管理 ---
    let purchases = JSON.parse(localStorage.getItem('okozukaiPurchases')) || [];
    let appStartDate = localStorage.getItem('okozukaiStartDate');
    // 初めて使う場合は、今日の日付を記録
    if (!appStartDate) {
        appStartDate = new Date().toISOString();
        localStorage.setItem('okozukaiStartDate', appStartDate);
    }

    // --- 褒め言葉のバリエーション ---
    const praiseVariations = [
        "1000円以下！素晴らしい！🎉",
        "ナイス節約！その調子！👍",
        "今日もやりくり上手ですね！✨",
        "堅実！未来の自分のためにナイスです！",
        "完璧な予算管理！お見事！💯"
    ];

    // --- 初期表示 ---
    updateAll();
    checkAnniversary(); // ★継続記念日をチェック

    // --- イベントリスナー ---
    spendButton.addEventListener('click', () => {
        const itemName = itemNameInput.value.trim();
        const amount = parseInt(expenseAmountInput.value, 10);

        if (!itemName || isNaN(amount) || amount <= 0) {
            alert('用途と正しい金額を入力してください。');
            return;
        }

        const newPurchase = {
            name: itemName,
            amount: amount,
            date: new Date().toISOString()
        };

        purchases.push(newPurchase);
        localStorage.setItem('okozukaiPurchases', JSON.stringify(purchases));

        updateAll();
        
        itemNameInput.value = '';
        expenseAmountInput.value = '';

        praiseUser();
    });

    // --- 関数エリア ---
    
    function updateAll() {
        updateBalance();
        renderHistory();
    }

    function updateBalance() {
        const startDate = new Date(appStartDate);
        const today = new Date();
        // 経過日数を計算（今日で1日目、明日で2日目...という形）
        const diffTime = today.setHours(0,0,0,0) - startDate.setHours(0,0,0,0);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        const totalAllowance = diffDays * 1000;
        const totalSpending = purchases.reduce((sum, item) => sum + item.amount, 0);
        const currentBalance = totalAllowance - totalSpending;

        balanceDisplay.textContent = `${currentBalance.toLocaleString()}円`;
    }

    function renderHistory() {
        historyList.innerHTML = '';
        [...purchases].reverse().forEach(item => {
            const li = document.createElement('li');
            const itemDate = new Date(item.date);
            const dateString = `${itemDate.getMonth() + 1}/${itemDate.getDate()}`;
            li.textContent = `${dateString}: ${item.name} - ${item.amount.toLocaleString()}円`;
            historyList.appendChild(li);
        });
    }

    // ★ユーザーをほめる関数（バリエーション追加版）★
    function praiseUser() {
        const today = new Date().toDateString();
        const todaysPurchases = purchases.filter(p => new Date(p.date).toDateString() === today);
        const todaysTotal = todaysPurchases.reduce((sum, item) => sum + item.amount, 0);

        if (todaysTotal <= 1000) {
            // 配列からランダムに1つ選ぶ
            const randomIndex = Math.floor(Math.random() * praiseVariations.length);
            feedbackMessage.textContent = praiseVariations[randomIndex];
        } else {
            feedbackMessage.textContent = `今日の出費は${todaysTotal.toLocaleString()}円。明日また頑張ろう！`;
        }
    }

    // ★継続記念日をチェックする関数★
    function checkAnniversary() {
        const startDate = new Date(appStartDate);
        const today = new Date();
        const diffTime = today.setHours(0,0,0,0) - startDate.setHours(0,0,0,0);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // 最後に表示した記念日を記録しておき、同じ日に何度も表示しないようにする
        const lastAnniversary = localStorage.getItem('lastAnniversary');
        const todayString = today.toDateString();

        if (lastAnniversary === todayString) return; // 今日すでに表示済みなら何もしない

        let anniversaryMessage = "";
        if (diffDays === 7) {
            anniversaryMessage = "祝・1週間達成！すごい！この調子で頑張ろう！🥳";
        } else if (diffDays === 30) {
            anniversaryMessage = "祝・1ヶ月達成！素晴らしい継続力です！🎊";
        }

        if (anniversaryMessage) {
            feedbackMessage.textContent = anniversaryMessage;
            // 今日表示したことを記録
            localStorage.setItem('lastAnniversary', todayString);
        }
    }
});