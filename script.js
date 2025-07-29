window.addEventListener('load', () => {
    // --- 要素の取得 ---
    const balanceDisplay = document.getElementById('balance-display');
    const feedbackMessage = document.getElementById('feedback-message');
    const itemNameInput = document.getElementById('item-name');
    const expenseAmountInput = document.getElementById('expense-amount');
    const spendButton = document.getElementById('spend-button');
    const incomeNameInput = document.getElementById('income-name');
    const incomeAmountInput = document.getElementById('income-amount');
    const incomeButton = document.getElementById('income-button');
    const historyList = document.getElementById('history-list');

    // --- データ管理 ---
    // ★支出と収入を一つの配列で管理★
    let transactions = JSON.parse(localStorage.getItem('okozukaiTransactions')) || [];
    let appStartDate = localStorage.getItem('okozukaiStartDate');
    if (!appStartDate) {
        appStartDate = new Date().toISOString();
        localStorage.setItem('okozukaiStartDate', appStartDate);
    }

    const praiseVariations = [ "1000円以下！素晴らしい！🎉", "ナイス節約！その調子！👍", "今日もやりくり上手ですね！✨", "堅実！未来の自分のためにナイスです！", "完璧な予算管理！お見事！💯" ];

    // --- 初期表示 ---
    updateAll();
    checkAnniversary();

    // --- イベントリスナー ---
    // 「使った！」ボタン
    spendButton.addEventListener('click', () => {
        const itemName = itemNameInput.value.trim();
        const amount = parseInt(expenseAmountInput.value, 10);
        if (!itemName || isNaN(amount) || amount <= 0) {
            alert('用途と正しい金額を入力してください。');
            return;
        }
        // ★type: 'expense'として支出を記録★
        const newTransaction = { id: Date.now(), type: 'expense', name: itemName, amount: amount, date: new Date().toISOString() };
        transactions.push(newTransaction);
        saveAndRerender();
        itemNameInput.value = '';
        expenseAmountInput.value = '';
        praiseUser();
    });

    // ★「追加する」ボタン（臨時収入）★
    incomeButton.addEventListener('click', () => {
        const incomeName = incomeNameInput.value.trim();
        const amount = parseInt(incomeAmountInput.value, 10);
        if (!incomeName || isNaN(amount) || amount <= 0) {
            alert('収入源と正しい金額を入力してください。');
            return;
        }
        // ★type: 'income'として収入を記録★
        const newTransaction = { id: Date.now(), type: 'income', name: incomeName, amount: amount, date: new Date().toISOString() };
        transactions.push(newTransaction);
        saveAndRerender();
        incomeNameInput.value = '';
        incomeAmountInput.value = '';
        feedbackMessage.textContent = `${incomeName}で${amount.toLocaleString()}円の収入！素晴らしい！`;
    });

    // 履歴リストのクリックイベント（削除処理）
    historyList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const idToDelete = parseInt(event.target.dataset.id, 10);
            if (confirm('この履歴を削除しますか？')) {
                transactions = transactions.filter(t => t.id !== idToDelete);
                saveAndRerender();
            }
        }
    });

    // --- 関数エリア ---
    function saveAndRerender() {
        localStorage.setItem('okozukaiTransactions', JSON.stringify(transactions));
        updateAll();
    }
    
    function updateAll() {
        updateBalance();
        renderHistory();
    }

    function updateBalance() {
        const startDate = new Date(appStartDate);
        const today = new Date();
        const diffTime = today.setHours(0,0,0,0) - startDate.setHours(0,0,0,0);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const totalAllowance = diffDays * 1000;
        
        // ★収入と支出を分けて計算★
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, item) => sum + item.amount, 0);
        const totalSpending = transactions.filter(t => t.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
        
        const currentBalance = totalAllowance + totalIncome - totalSpending;
        balanceDisplay.textContent = `${currentBalance.toLocaleString()}円`;
    }

    function renderHistory() {
        historyList.innerHTML = '';
        [...transactions].reverse().forEach(item => {
            const li = document.createElement('li');
            const itemDate = new Date(item.date);
            const dateString = `${itemDate.getMonth() + 1}/${itemDate.getDate()}`;
            
            // ★収入か支出かで色分け★
            const amountClass = item.type === 'income' ? 'income-amount' : 'expense-amount';
            const sign = item.type === 'income' ? '+' : '-';

            li.innerHTML = `
                <span>${dateString}: ${item.name}</span>
                <span class="${amountClass}">${sign}${item.amount.toLocaleString()}円</span>
                <button class="delete-btn" data-id="${item.id}">削除</button>
            `;
            historyList.appendChild(li);
        });
    }

    function praiseUser() {
        const today = new Date().toDateString();
        const todaysPurchases = transactions.filter(t => t.type === 'expense' && new Date(t.date).toDateString() === today);
        const todaysTotal = todaysPurchases.reduce((sum, item) => sum + item.amount, 0);
        if (todaysTotal <= 1000) {
            const randomIndex = Math.floor(Math.random() * praiseVariations.length);
            feedbackMessage.textContent = praiseVariations[randomIndex];
        } else {
            feedbackMessage.textContent = `今日の出費は${todaysTotal.toLocaleString()}円。明日また頑張ろう！`;
        }
    }

    function checkAnniversary() {
        const startDate = new Date(appStartDate);
        const today = new Date();
        const diffTime = today.setHours(0,0,0,0) - startDate.setHours(0,0,0,0);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const lastAnniversary = localStorage.getItem('lastAnniversary');
        const todayString = today.toDateString();
        if (lastAnniversary === todayString) return;
        let anniversaryMessage = "";
        if (diffDays === 7) {
            anniversaryMessage = "祝・1週間達成！すごい！この調子で頑張ろう！🥳";
        } else if (diffDays === 30) {
            anniversaryMessage = "祝・1ヶ月達成！素晴らしい継続力です！🎊";
        }
        if (anniversaryMessage) {
            feedbackMessage.textContent = anniversaryMessage;
            localStorage.setItem('lastAnniversary', todayString);
        }
    }
});