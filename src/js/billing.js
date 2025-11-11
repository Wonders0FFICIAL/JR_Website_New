function getUserBillingData() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return {
            plan: 'free',
            planName: 'Free Plan',
            price: 0,
            cycle: 'monthly',
            nextBillingDate: null,
            status: 'active',
            paymentMethod: null,
            invoices: []
        };
    }

    return currentUser.billing || {
        plan: 'free',
        planName: 'Free Plan',
        price: 0,
        cycle: 'monthly',
        nextBillingDate: null,
        status: 'active',
        paymentMethod: null,
        invoices: []
    };
}

function getCurrentUser() {
    const currentUserKey = localStorage.getItem('currentUser');
    if (!currentUserKey) return null;

    try {
        return JSON.parse(currentUserKey);
    } catch (e) {
        const userData = localStorage.getItem(currentUserKey);
        if (userData) {
            return JSON.parse(userData);
        }
    }
    return null;
}

function saveUserBillingData(billingData) {
    const currentUserKey = localStorage.getItem('currentUser');
    if (!currentUserKey) return false;

    let user;
    let storageKey = 'currentUser';

    try {
        user = JSON.parse(currentUserKey);
        if (currentUserKey.includes('_user_')) {
            storageKey = currentUserKey;
        }
    } catch (e) {
        user = JSON.parse(localStorage.getItem(currentUserKey));
        storageKey = currentUserKey;
    }

    if (user) {
        user.billing = billingData;
        localStorage.setItem(storageKey, JSON.stringify(user));
        if (storageKey !== 'currentUser') {
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
        return true;
    }
    return false;
}

function initializeCurrentPlan() {
    const billingData = getUserBillingData();

    document.getElementById('planBadge').textContent = billingData.plan.charAt(0).toUpperCase() + billingData.plan.slice(1);
    document.getElementById('planName').textContent = billingData.planName;

    const priceText = billingData.price === 0
        ? '$0.00 / month'
        : `$${billingData.price.toFixed(2)} / ${billingData.cycle}`;
    document.getElementById('planPrice').textContent = priceText;

    if (billingData.nextBillingDate) {
        document.getElementById('nextBillingDate').textContent = formatDate(billingData.nextBillingDate);
    } else {
        document.getElementById('nextBillingDate').textContent = 'N/A';
    }

    document.getElementById('planStatus').textContent = billingData.status.charAt(0).toUpperCase() + billingData.status.slice(1);

    const upgradeBtn = document.getElementById('upgradeBtn');
    if (billingData.plan === 'enterprise') {
        upgradeBtn.textContent = 'Current Plan';
        upgradeBtn.disabled = true;
        upgradeBtn.style.cursor = 'not-allowed';
    } else if (billingData.plan === 'pro') {
        upgradeBtn.textContent = 'Upgrade to Enterprise';
    } else {
        upgradeBtn.textContent = 'View All Plans';
    }

    const manageSection = document.getElementById('manageSubscriptionSection');
    if (billingData.plan !== 'free') {
        manageSection.style.display = 'block';
    } else {
        manageSection.style.display = 'none';
    }

    updatePlanSelectionButtons(billingData.plan);
}

function updatePlanSelectionButtons(currentPlan) {
    const planButtons = document.querySelectorAll('.select-plan-btn');
    planButtons.forEach(btn => {
        const planType = btn.dataset.plan || btn.closest('.plan-option').dataset.plan;
        if (planType === currentPlan) {
            btn.textContent = 'Current Plan';
            btn.classList.add('current');
            btn.disabled = true;
        } else {
            btn.textContent = 'Select Plan';
            btn.classList.remove('current');
            btn.disabled = false;
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function initializePaymentMethod() {
    const billingData = getUserBillingData();
    const container = document.getElementById('paymentMethodsContainer');

    if (billingData.paymentMethod) {
        container.innerHTML = `
            <div class="payment-method-card">
                <div class="payment-info">
                    <div class="card-icon">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <div class="card-details">
                        <h4>${billingData.paymentMethod.type} •••• ${billingData.paymentMethod.last4}</h4>
                        <p>Expires ${billingData.paymentMethod.expiry}</p>
                    </div>
                </div>
                <div class="payment-actions">
                    <button class="edit-payment-btn" id="editPaymentBtn">Edit</button>
                    <button class="delete-payment-btn" id="deletePaymentBtn">Remove</button>
                </div>
            </div>
        `;

        document.getElementById('editPaymentBtn').addEventListener('click', showAddPaymentModal);
        document.getElementById('deletePaymentBtn').addEventListener('click', removePaymentMethod);
    } else {
        container.innerHTML = `
            <div class="no-payment-message">
                <i class="fas fa-credit-card"></i>
                <p>No payment method added</p>
                <button class="add-payment-btn" id="addPaymentBtn">Add Payment Method</button>
            </div>
        `;

        document.getElementById('addPaymentBtn').addEventListener('click', showAddPaymentModal);
    }
}

function showAddPaymentModal() {
    document.getElementById('addPaymentModal').style.display = 'flex';
}

function closeAddPaymentModal() {
    document.getElementById('addPaymentModal').style.display = 'none';
    clearPaymentForm();
}

function clearPaymentForm() {
    document.getElementById('cardNumber').value = '';
    document.getElementById('expiryDate').value = '';
    document.getElementById('cvv').value = '';
    document.getElementById('cardholderName').value = '';
}

function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = formattedValue;
}

function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        let month = value.substring(0, 2);
        if (month.length === 1 && parseInt(month) > 0) {
            month = month.padStart(2, '0');
        }
        if (parseInt(month) > 12) {
            month = '12';
        }
        if (parseInt(month) < 1) {
            month = '01';
        }
        value = month + (value.length > 2 ? '/' + value.substring(2, 6) : '');
    }
    input.value = value;
}

function savePaymentMethod() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const cardholderName = document.getElementById('cardholderName').value;

    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        showErrorMessage('Please fill in all fields');
        return;
    }

    if (cardNumber.length !== 16) {
        showErrorMessage('Please enter a valid 16-digit card number');
        return;
    }

    if (cvv.length !== 3) {
        showErrorMessage('Please enter a valid 3-digit CVV');
        return;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/(\d{4})$/;
    if (!expiryRegex.test(expiryDate)) {
        showErrorMessage('Please enter a valid expiry date in MM/YYYY format (e.g., 04/2025)');
        return;
    }

    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const expMonth = parseInt(month);
    const expYear = parseInt(year);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        showErrorMessage('Please enter a future expiry date');
        return;
    }

    let currentUser = getCurrentUser();
    if (!currentUser) {
        currentUser = {
            id: 'demo_user_' + Date.now(),
            email: 'demo@example.com',
            name: 'Demo User',
            billing: {}
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    const billingData = getUserBillingData();
    billingData.paymentMethod = {
        type: 'Credit Card',
        last4: cardNumber.slice(-4),
        expiry: expiryDate,
        cardholderName: cardholderName
    };

    if (saveUserBillingData(billingData)) {
        closeAddPaymentModal();
        initializePaymentMethod();
        showSuccessMessage('Payment method added successfully!');
    } else {
        showErrorMessage('Failed to save payment method. Please try again.');
    }
}

function removePaymentMethod() {
    if (!confirm('Are you sure you want to remove this payment method?')) {
        return;
    }

    const billingData = getUserBillingData();
    billingData.paymentMethod = null;
    
    if (saveUserBillingData(billingData)) {
        initializePaymentMethod();
        showSuccessMessage('Payment method removed successfully');
    } else {
        showErrorMessage('Failed to remove payment method. Please try again.');
    }
}

function initializeBillingCycle() {
    const cycleButtons = document.querySelectorAll('.cycle-btn');

    cycleButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            cycleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const cycle = this.dataset.cycle;
            updatePlanPrices(cycle);
        });
    });
}

function updatePlanPrices(cycle) {
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const yearlyPrices = document.querySelectorAll('.yearly-price');

    if (cycle === 'monthly') {
        monthlyPrices.forEach(el => el.style.display = 'inline');
        yearlyPrices.forEach(el => el.style.display = 'none');
    } else {
        monthlyPrices.forEach(el => el.style.display = 'none');
        yearlyPrices.forEach(el => el.style.display = 'inline');
    }
}

function handlePlanSelection() {
    const selectButtons = document.querySelectorAll('.select-plan-btn:not(.current)');

    selectButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const planOption = this.closest('.plan-option');
            const plan = planOption.dataset.plan;
            const cycle = document.querySelector('.cycle-btn.active').dataset.cycle;

            selectPlan(plan, cycle);
        });
    });
}

function selectPlan(plan, cycle) {
    const planNames = {
        free: 'Free Plan',
        pro: 'Pro Plan',
        enterprise: 'Enterprise Plan'
    };

    const monthlyPrices = {
        free: 0,
        pro: 9.99,
        enterprise: 49.99
    };

    const yearlyPrices = {
        free: 0,
        pro: 7.99,
        enterprise: 39.99
    };

    const price = cycle === 'monthly' ? monthlyPrices[plan] : yearlyPrices[plan];

    const billingData = getUserBillingData();

    if (plan !== 'free' && !billingData.paymentMethod) {
        showErrorMessage('Please add a payment method before upgrading');
        showAddPaymentModal();
        return;
    }

    billingData.plan = plan;
    billingData.planName = planNames[plan];
    billingData.price = price;
    billingData.cycle = cycle;

    if (plan !== 'free') {
        const nextDate = new Date();
        if (cycle === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
        billingData.nextBillingDate = nextDate.toISOString();

        const invoice = {
            id: 'INV-' + Date.now(),
            date: new Date().toISOString(),
            description: `${planNames[plan]} - ${cycle.charAt(0).toUpperCase() + cycle.slice(1)}`,
            amount: price,
            status: 'paid'
        };

        if (!billingData.invoices) {
            billingData.invoices = [];
        }
        billingData.invoices.unshift(invoice);
    } else {
        billingData.nextBillingDate = null;
    }

    saveUserBillingData(billingData);
    initializeCurrentPlan();
    initializeInvoices();

    showSuccessMessage(`Successfully ${plan === 'free' ? 'downgraded to' : 'upgraded to'} ${planNames[plan]}`);
}

function initializeInvoices() {
    const billingData = getUserBillingData();
    const tbody = document.getElementById('invoicesTableBody');

    if (!billingData.invoices || billingData.invoices.length === 0) {
        tbody.innerHTML = `
            <tr class="no-data-row">
                <td colspan="5">
                    <div class="no-invoices-message">
                        <i class="fas fa-receipt"></i>
                        <p>No payment history available</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = billingData.invoices.map(invoice => {
        const statusClass = `status-${invoice.status}`;
        const statusText = invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);

        return `
            <tr>
                <td>${formatDate(invoice.date)}</td>
                <td>${invoice.description}</td>
                <td>$${invoice.amount.toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td><a href="#" class="download-btn" onclick="downloadInvoice('${invoice.id}'); return false;"><i class="fas fa-download"></i> PDF</a></td>
            </tr>
        `;
    }).join('');
}

function downloadInvoice(invoiceId) {
    alert(`Downloading invoice ${invoiceId}...`);
}

function showSuccessMessage(message) {
    const existingMessage = document.querySelector('.billing-success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageHTML = `
        <div class="success-notice billing-success-message">
            <i class="fas fa-check-circle"></i>
            <div>
                <strong>Success</strong>
                <p>${message}</p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', messageHTML);

    setTimeout(() => {
        const msg = document.querySelector('.billing-success-message');
        if (msg) {
            msg.remove();
        }
    }, 3000);
}

function showErrorMessage(message) {
    const existingMessage = document.querySelector('.billing-error-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageHTML = `
        <div class="error-notice billing-error-message">
            <i class="fas fa-exclamation-circle"></i>
            <div>
                <strong>Error</strong>
                <p>${message}</p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', messageHTML);

    setTimeout(() => {
        const msg = document.querySelector('.billing-error-message');
        if (msg) {
            msg.remove();
        }
    }, 5000);
}

function initializeCancelSubscription() {
    const cancelBtn = document.getElementById('cancelSubscriptionBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', showCancelModal);
    }
}

function showCancelModal() {
    const billingData = getUserBillingData();
    if (billingData.nextBillingDate) {
        document.getElementById('subscriptionEndDate').textContent = formatDate(billingData.nextBillingDate);
    }
    document.getElementById('cancelSubscriptionModal').style.display = 'flex';
}

function closeCancelModal() {
    document.getElementById('cancelSubscriptionModal').style.display = 'none';
}

function cancelSubscription() {
    const billingData = getUserBillingData();

    billingData.status = 'cancelled';
    saveUserBillingData(billingData);

    closeCancelModal();
    showSuccessMessage('Subscription cancelled. Your plan will remain active until ' + formatDate(billingData.nextBillingDate));

    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

document.addEventListener('DOMContentLoaded', function () {
    initializeCurrentPlan();
    initializePaymentMethod();
    initializeBillingCycle();
    handlePlanSelection();
    initializeInvoices();
    initializeCancelSubscription();

    document.getElementById('closePaymentModal').addEventListener('click', closeAddPaymentModal);
    document.getElementById('cancelPaymentBtn').addEventListener('click', closeAddPaymentModal);
    document.getElementById('savePaymentBtn').addEventListener('click', savePaymentMethod);

    document.getElementById('cardNumber').addEventListener('input', function(e) {

        this.value = this.value.replace(/\D/g, '');
        formatCardNumber(this);
    });

    document.getElementById('expiryDate').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '');
        formatExpiryDate(this);
    });

    document.getElementById('cvv').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').slice(0, 3);
    });

    document.getElementById('cardNumber').addEventListener('paste', function(e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        this.value = text;
        formatCardNumber(this);
    });

    document.getElementById('expiryDate').addEventListener('paste', function(e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        this.value = text;
        formatExpiryDate(this);
    });

    document.getElementById('closeCancelModal').addEventListener('click', closeCancelModal);
    document.getElementById('keepSubscriptionBtn').addEventListener('click', closeCancelModal);
    document.getElementById('confirmCancelBtn').addEventListener('click', cancelSubscription);

    document.getElementById('addPaymentModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeAddPaymentModal();
        }
    });

    document.getElementById('cancelSubscriptionModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeCancelModal();
        }
    });

    document.getElementById('upgradeBtn').addEventListener('click', function () {
        if (!this.disabled) {
            window.location.href = 'pricing.html';
        }
    });
});