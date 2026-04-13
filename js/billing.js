const memoryStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = String(value);
    },
    removeItem(key) {
        delete this.data[key];
    },
    clear() {
        this.data = {};
    }
};

const PROJECT_CONFIG = {
    browse: {
        name: 'JR. Browse',
        plans: {
            free: { name: 'Free', price: 0, features: ['Basic browsing', '100 searches/day', 'Standard protection'] },
            pro: { name: 'Pro', price: 9.99, features: ['Unlimited searches', 'Advanced security', 'Priority support'] },
            enterprise: { name: 'Enterprise', price: 49.99, features: ['Custom integration', 'Dedicated support', 'Team management'] }
        },
        usageMetrics: [
            { label: 'Searches', current: 50, max: 100 },
            { label: 'Storage', current: 150, max: 500, unit: 'MB' },
            { label: 'API Requests', current: 1240, max: 10000 }
        ]
    },
    ai: {
        name: 'JR. AI',
        plans: {
            free: { name: 'Starter', price: 0, features: ['Basic AI models', '100 queries/day', 'Standard response'] },
            pro: { name: 'Plus', price: 19.99, features: ['Advanced models', 'Unlimited queries', 'Priority access'] },
            enterprise: { name: 'Enterprise', price: 99.99, features: ['Custom training', 'API access', '24/7 support'] }
        },
        usageMetrics: [
            { label: 'AI Queries', current: 75, max: 100 },
            { label: 'Model Training', current: 2, max: 5, unit: 'hours' },
            { label: 'API Calls', current: 850, max: 1000 }
        ]
    },
    cloud: {
        name: 'JR. Cloud',
        plans: {
            free: { name: 'Basic', price: 0, features: ['10GB storage', 'Basic sharing', 'Standard encryption'] },
            pro: { name: 'Premium', price: 14.99, features: ['1TB storage', 'Advanced sharing', 'End-to-end encryption'] },
            enterprise: { name: 'Enterprise', price: 79.99, features: ['Unlimited storage', 'Team collaboration', 'Advanced security'] }
        },
        usageMetrics: [
            { label: 'Storage Used', current: 8.5, max: 10, unit: 'GB' },
            { label: 'File Uploads', current: 45, max: 100 },
            { label: 'Bandwidth', current: 25, max: 50, unit: 'GB' }
        ]
    },
    lang: {
        name: 'JR. Lang',
        plans: {
            free: { name: 'Community', price: 0, features: ['Basic tools', 'Public repos', 'Standard compiler'] },
            pro: { name: 'Professional', price: 24.99, features: ['Private repos', 'Advanced compiler', 'Priority support'] },
            enterprise: { name: 'Enterprise', price: 149.99, features: ['Team tools', 'Custom extensions', '24/7 support'] }
        },
        usageMetrics: [
            { label: 'Compile Time', current: 45, max: 60, unit: 'min' },
            { label: 'Repositories', current: 3, max: 5 },
            { label: 'Code Analysis', current: 120, max: 200, unit: 'files' }
        ]
    }
};

let currentProject = 'browse';

function getUserBillingData() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return initializeDefaultBillingData();
    }

    return currentUser.billing || initializeDefaultBillingData();
}

function initializeDefaultBillingData() {
    const billingData = {
        projects: {},
        paymentMethod: null,
        sharedInvoices: []
    };

    Object.keys(PROJECT_CONFIG).forEach(project => {
        billingData.projects[project] = {
            plan: 'free',
            cycle: 'monthly',
            nextBillingDate: null,
            status: 'active',
            usage: generateDefaultUsage(project)
        };
    });

    const signupDate = getSignupDate();
    billingData.sharedInvoices.push({
        id: 'SIGNUP-' + Date.now(),
        date: signupDate,
        description: 'Welcome to JR.',
        amount: 0,
        status: 'active',
        project: 'all'
    });

    return billingData;
}

function getSignupDate() {
    try {
        const signupData = memoryStorage.getItem('userSignupDate');
        if (signupData) {
            return signupData;
        }

        const demoSignupDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        memoryStorage.setItem('userSignupDate', demoSignupDate);
        return demoSignupDate;
    } catch (e) {
        console.error('Error getting signup date:', e);
        return new Date().toISOString();
    }
}

function generateDefaultUsage(project) {
    const config = PROJECT_CONFIG[project];
    return config.usageMetrics.map(metric => ({
        ...metric,
        current: Math.floor(Math.random() * metric.max * 0.8)
    }));
}

function getCurrentUser() {
    try {
        const currentUserData = memoryStorage.getItem('currentUser');
        if (!currentUserData) return null;

        return JSON.parse(currentUserData);
    } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}

function saveUserBillingData(billingData) {
    const currentUserKey = memoryStorage.getItem('currentUser');
    if (!currentUserKey) {
        const defaultUser = {
            id: 'demo_user_' + Date.now(),
            email: 'demo@example.com',
            name: 'Demo User',
            billing: billingData
        };
        memoryStorage.setItem('currentUser', JSON.stringify(defaultUser));
        return true;
    }

    let user;
    let storageKey = 'currentUser';

    try {
        user = JSON.parse(currentUserKey);
        if (currentUserKey.includes('_user_')) {
            storageKey = currentUserKey;
        }
    } catch (e) {
        user = JSON.parse(memoryStorage.getItem(currentUserKey));
        storageKey = currentUserKey;
    }

    if (user) {
        user.billing = billingData;
        memoryStorage.setItem(storageKey, JSON.stringify(user));
        if (storageKey !== 'currentUser') {
            memoryStorage.setItem('currentUser', JSON.stringify(user));
        }
        return true;
    }
    return false;
}

function initializeProjectTabs() {
    const projectTabs = document.querySelectorAll('.project-tab');

    projectTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            projectTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            currentProject = tab.getAttribute('data-project');
            refreshProjectDisplay();
        });
    });
}

function refreshProjectDisplay() {
    const billingData = getUserBillingData();
    const projectData = billingData.projects[currentProject];
    const projectConfig = PROJECT_CONFIG[currentProject];
    const planConfig = projectConfig.plans[projectData.plan];

    const projectTitle = document.getElementById('projectTitle');
    const projectSubtitle = document.getElementById('projectSubtitle');
    const projectName = document.getElementById('projectName');

    if (projectTitle) projectTitle.textContent = `${projectConfig.name} - Billing & Plans`;
    if (projectSubtitle) projectSubtitle.textContent = `Manage your ${projectConfig.name} subscription and usage`;
    if (projectName) projectName.textContent = projectConfig.name;

    initializeCurrentPlan();
    updateUsageDisplay();
}

function initializeCurrentPlan() {
    const billingData = getUserBillingData();
    const projectData = billingData.projects[currentProject];
    const projectConfig = PROJECT_CONFIG[currentProject];
    const planConfig = projectConfig.plans[projectData.plan];

    const planName = document.getElementById('planName');
    const planPrice = document.getElementById('planPrice');
    const nextBillingDate = document.getElementById('nextBillingDate');
    const planStatus = document.getElementById('planStatus');
    const upgradeBtn = document.getElementById('upgradeBtn');
    const manageSection = document.getElementById('manageSubscriptionSection');

    if (planName) {
        planName.textContent = `${planConfig.name} Plan`;
    }

    if (planPrice) {
        const priceText = planConfig.price === 0
            ? '$0.00 / month'
            : `$${planConfig.price.toFixed(2)} / ${projectData.cycle}`;
        planPrice.textContent = priceText;
    }

    if (nextBillingDate) {
        if (projectData.nextBillingDate) {
            nextBillingDate.textContent = formatDate(projectData.nextBillingDate);
        } else {
            nextBillingDate.textContent = 'N/A';
        }
    }

    if (planStatus) {
        planStatus.textContent = projectData.status.charAt(0).toUpperCase() + projectData.status.slice(1);
    }

    if (upgradeBtn) {
        if (projectData.plan === 'enterprise') {
            upgradeBtn.textContent = 'Current Plan';
            upgradeBtn.disabled = true;
            upgradeBtn.style.cursor = 'not-allowed';
        } else {
            upgradeBtn.textContent = 'View All Plans';
            upgradeBtn.disabled = false;
            upgradeBtn.style.cursor = 'pointer';
        }
    }

    if (manageSection) {
        if (projectData.plan !== 'free') {
            manageSection.style.display = 'block';
        } else {
            manageSection.style.display = 'none';
        }
    }
}

function updateUsageDisplay() {
    const billingData = getUserBillingData();
    const projectData = billingData.projects[currentProject];
    const usageData = projectData.usage;

    for (let i = 0; i < Math.min(usageData.length, 3); i++) {
        const metric = usageData[i];
        const usageLabel = document.getElementById(`usageLabel${i + 1}`);
        const usageCount = document.getElementById(`usageCount${i + 1}`);
        const usageBar = document.getElementById(`usageBar${i + 1}`);

        if (usageLabel) usageLabel.textContent = metric.label;
        if (usageCount) {
            const unit = metric.unit ? ` ${metric.unit}` : '';
            usageCount.textContent = `${metric.current}${unit} / ${metric.max}${unit}`;
        }
        if (usageBar) {
            const percentage = (metric.current / metric.max) * 100;
            usageBar.style.width = `${Math.min(percentage, 100)}%`;
        }
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function initializePaymentMethod() {
    const billingData = getUserBillingData();
    const container = document.getElementById('paymentMethodsContainer');

    if (!container) return;

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

        const editBtn = document.getElementById('editPaymentBtn');
        const deleteBtn = document.getElementById('deletePaymentBtn');
        if (editBtn) editBtn.addEventListener('click', () => showAddPaymentModal(true));
        if (deleteBtn) deleteBtn.addEventListener('click', removePaymentMethod);
    } else {
        container.innerHTML = `
            <div class="no-payment-message">
                <i class="fas fa-credit-card"></i>
                <p>No payment method added</p>
                <button class="add-payment-btn" id="addPaymentBtn">Add Payment Method</button>
            </div>
        `;

        const addBtn = document.getElementById('addPaymentBtn');
        if (addBtn) addBtn.addEventListener('click', () => showAddPaymentModal(false));
    }
}

function showAddPaymentModal(isEdit = false) {
    const modal = document.getElementById('addPaymentModal');
    const modalTitle = modal.querySelector('.modal-header h3');
    const saveBtn = document.getElementById('savePaymentBtn');

    if (isEdit) {
        modalTitle.textContent = 'Edit Payment Method';
        saveBtn.textContent = 'Update Card';

        const billingData = getUserBillingData();
        if (billingData.paymentMethod) {
            const cardNumberEl = document.getElementById('cardNumber');
            const expiryDateEl = document.getElementById('expiryDate');
            const cardholderNameEl = document.getElementById('cardholderName');

            if (cardNumberEl) {
                cardNumberEl.value = '•••• •••• •••• ' + billingData.paymentMethod.last4;
                cardNumberEl.placeholder = 'Enter new card or keep existing';
            }

            if (expiryDateEl) {
                expiryDateEl.value = billingData.paymentMethod.expiry;
            }

            if (cardholderNameEl) {
                cardholderNameEl.value = billingData.paymentMethod.cardholderName;
            }
        }
    } else {
        modalTitle.textContent = 'Add Payment Method';
        saveBtn.textContent = 'Add Card';
        clearPaymentForm();
    }

    if (modal) modal.style.display = 'flex';
}

function closeAddPaymentModal() {
    const modal = document.getElementById('addPaymentModal');
    if (modal) modal.style.display = 'none';
    clearPaymentForm();
}

function clearPaymentForm() {
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');
    const cardholderName = document.getElementById('cardholderName');

    if (cardNumber) {
        cardNumber.value = '';
        cardNumber.placeholder = '1234 5678 9012 3456';
    }
    if (expiryDate) expiryDate.value = '';
    if (cvv) cvv.value = '';
    if (cardholderName) cardholderName.value = '';
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
        if (month.length === 1 && parseInt(month) > 1) {
            month = '0' + month;
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
    const cardNumberEl = document.getElementById('cardNumber');
    const expiryDateEl = document.getElementById('expiryDate');
    const cvvEl = document.getElementById('cvv');
    const cardholderNameEl = document.getElementById('cardholderName');

    if (!cardNumberEl || !expiryDateEl || !cvvEl || !cardholderNameEl) {
        showErrorMessage('Form elements not found');
        return;
    }

    let cardNumber = cardNumberEl.value.replace(/\s/g, '');
    const expiryDate = expiryDateEl.value;
    const cvv = cvvEl.value;
    const cardholderName = cardholderNameEl.value;

    const billingData = getUserBillingData();
    const isEditingExisting = cardNumber.includes('••••') && billingData.paymentMethod;

    if (isEditingExisting) {
        cardNumber = '0000000000' + billingData.paymentMethod.last4;
    }

    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        showErrorMessage('Please fill in all fields');
        return;
    }

    if (!isEditingExisting && cardNumber.length !== 16) {
        showErrorMessage('Please enter a valid 16-digit card number');
        return;
    }

    if (cvv.length !== 3) {
        showErrorMessage('Please enter a valid 3-digit CVV');
        return;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
    if (!expiryRegex.test(expiryDate)) {
        showErrorMessage('Please enter a valid expiry date in MM/YY or MM/YYYY format');
        return;
    }

    const [month, year] = expiryDate.split('/');
    const expMonth = parseInt(month);
    let expYear = parseInt(year);

    if (year.length === 2) {
        expYear = 2000 + expYear;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        showErrorMessage('Card has expired. Please enter a valid future expiry date');
        return;
    }

    let currentUser = getCurrentUser();
    if (!currentUser) {
        currentUser = {
            id: 'demo_user_' + Date.now(),
            email: 'demo@example.com',
            name: 'Demo User',
            billing: initializeDefaultBillingData()
        };
        memoryStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    const updatedBillingData = getUserBillingData();
    updatedBillingData.paymentMethod = {
        type: 'Credit Card',
        last4: cardNumber.slice(-4),
        expiry: expiryDate,
        cardholderName: cardholderName
    };

    if (saveUserBillingData(updatedBillingData)) {
        closeAddPaymentModal();
        initializePaymentMethod();
        showSuccessMessage(isEditingExisting ? 'Payment method updated successfully!' : 'Payment method added successfully!');
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

function selectPlan(plan, cycle) {
    const billingData = getUserBillingData();
    const projectConfig = PROJECT_CONFIG[currentProject];
    const planConfig = projectConfig.plans[plan];

    if (plan !== 'free' && !billingData.paymentMethod) {
        showErrorMessage('Please add a payment method before upgrading');
        showAddPaymentModal();
        return;
    }

    billingData.projects[currentProject].plan = plan;
    billingData.projects[currentProject].cycle = cycle;
    billingData.projects[currentProject].price = planConfig.price;

    if (plan !== 'free') {
        const nextDate = new Date();
        if (cycle === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
        billingData.projects[currentProject].nextBillingDate = nextDate.toISOString();

        const invoice = {
            id: 'INV-' + Date.now(),
            date: new Date().toISOString(),
            description: `${projectConfig.name} - ${planConfig.name} (${cycle})`,
            amount: planConfig.price,
            status: 'paid',
            project: currentProject
        };

        if (!billingData.sharedInvoices) {
            billingData.sharedInvoices = [];
        }
        billingData.sharedInvoices.unshift(invoice);
    } else {
        billingData.projects[currentProject].nextBillingDate = null;
        billingData.projects[currentProject].price = 0;
    }

    saveUserBillingData(billingData);
    refreshProjectDisplay();
    initializeInvoices();

    showSuccessMessage(`Successfully ${plan === 'free' ? 'downgraded to' : 'upgraded to'} ${planConfig.name} for ${projectConfig.name}`);
}

function initializeInvoices() {
    const billingData = getUserBillingData();
    const tbody = document.getElementById('invoicesTableBody');

    if (!tbody) return;

    const projectInvoices = billingData.sharedInvoices ?
        billingData.sharedInvoices.filter(invoice => invoice.project === currentProject || invoice.project === 'all') : [];

    if (projectInvoices.length === 0) {
        tbody.innerHTML = `
            <tr class="no-data-row">
                <td colspan="5">
                    <div class="no-invoices-message">
                        <i class="fas fa-receipt"></i>
                        <p>No payment history available for ${PROJECT_CONFIG[currentProject].name}</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = projectInvoices.map(invoice => {
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
    try {
        const billingData = getUserBillingData();
        const invoice = billingData.sharedInvoices ?
            billingData.sharedInvoices.find(inv => inv.id === invoiceId) : null;

        if (!invoice) {
            showErrorMessage('Invoice not found');
            return;
        }

        const invoiceContent = `
INVOICE: ${invoice.id}
Date: ${formatDate(invoice.date)}
Description: ${invoice.description}
Amount: $${invoice.amount.toFixed(2)}
Status: ${invoice.status.toUpperCase()}
----------------------------------------
Thank you for your business!
        `.trim();

        const blob = new Blob([invoiceContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccessMessage(`Invoice ${invoice.id} downloaded`);
    } catch (error) {
        console.error('Error downloading invoice:', error);
        showErrorMessage('Failed to download invoice');
    }
}

function showSuccessMessage(message) {
    const existingMessages = document.querySelectorAll('.billing-success-message, .billing-error-message, .billing-warning-message, .billing-info-message');
    existingMessages.forEach(msg => {
        if (msg.parentNode) msg.remove();
    });

    const messageHTML = `
        <div class="billing-success-message">
            <i class="fas fa-check-circle"></i>
            <div>
                <strong>Success</strong>
                <p>${message}</p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', messageHTML);

    const messageElement = document.querySelector('.billing-success-message');
    setTimeout(() => {
        if (messageElement && messageElement.parentNode) {
            messageElement.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (messageElement.parentNode) messageElement.remove();
            }, 300);
        }
    }, 3000);
}

function showErrorMessage(message) {
    const existingMessages = document.querySelectorAll('.billing-success-message, .billing-error-message, .billing-warning-message, .billing-info-message');
    existingMessages.forEach(msg => {
        if (msg.parentNode) msg.remove();
    });

    const messageHTML = `
        <div class="billing-error-message">
            <i class="fas fa-exclamation-circle"></i>
            <div>
                <strong>Error</strong>
                <p>${message}</p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', messageHTML);

    const messageElement = document.querySelector('.billing-error-message');
    setTimeout(() => {
        if (messageElement && messageElement.parentNode) {
            messageElement.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (messageElement.parentNode) messageElement.remove();
            }, 300);
        }
    }, 5000);
}

function showWarningMessage(message) {
    const existingMessages = document.querySelectorAll('.billing-success-message, .billing-error-message, .billing-warning-message, .billing-info-message');
    existingMessages.forEach(msg => {
        if (msg.parentNode) msg.remove();
    });

    const messageHTML = `
        <div class="billing-warning-message">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <strong>Warning</strong>
                <p>${message}</p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', messageHTML);

    const messageElement = document.querySelector('.billing-warning-message');
    setTimeout(() => {
        if (messageElement && messageElement.parentNode) {
            messageElement.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (messageElement.parentNode) messageElement.remove();
            }, 300);
        }
    }, 4000);
}

function showInfoMessage(message) {
    const existingMessages = document.querySelectorAll('.billing-success-message, .billing-error-message, .billing-warning-message, .billing-info-message');
    existingMessages.forEach(msg => {
        if (msg.parentNode) msg.remove();
    });

    const messageHTML = `
        <div class="billing-info-message">
            <i class="fas fa-info-circle"></i>
            <div>
                <strong>Info</strong>
                <p>${message}</p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', messageHTML);

    const messageElement = document.querySelector('.billing-info-message');
    setTimeout(() => {
        if (messageElement && messageElement.parentNode) {
            messageElement.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (messageElement.parentNode) messageElement.remove();
            }, 300);
        }
    }, 3500);
}

function initializeCancelSubscription() {
    const cancelBtn = document.getElementById('cancelSubscriptionBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', showCancelModal);
    }
}

function showCancelModal() {
    const billingData = getUserBillingData();
    const projectData = billingData.projects[currentProject];
    const modal = document.getElementById('cancelSubscriptionModal');
    const endDateElement = document.getElementById('subscriptionEndDate');

    if (projectData.nextBillingDate && endDateElement) {
        endDateElement.textContent = formatDate(projectData.nextBillingDate);
    }
    if (modal) modal.style.display = 'flex';
}

function closeCancelModal() {
    const modal = document.getElementById('cancelSubscriptionModal');
    if (modal) modal.style.display = 'none';
}

function cancelSubscription() {
    const billingData = getUserBillingData();

    billingData.projects[currentProject].status = 'cancelled';
    billingData.projects[currentProject].plan = 'free';
    billingData.projects[currentProject].price = 0;
    billingData.projects[currentProject].nextBillingDate = null;

    saveUserBillingData(billingData);

    closeCancelModal();
    showSuccessMessage(`Subscription cancelled for ${PROJECT_CONFIG[currentProject].name}. You have been downgraded to the Free plan.`);

    setTimeout(() => {
        refreshProjectDisplay();
    }, 2000);
}

document.addEventListener('DOMContentLoaded', function () {
    initializeProjectTabs();
    refreshProjectDisplay();
    initializePaymentMethod();
    initializeInvoices();
    initializeCancelSubscription();

    const closePaymentModal = document.getElementById('closePaymentModal');
    const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
    const savePaymentBtn = document.getElementById('savePaymentBtn');

    if (closePaymentModal) closePaymentModal.addEventListener('click', closeAddPaymentModal);
    if (cancelPaymentBtn) cancelPaymentBtn.addEventListener('click', closeAddPaymentModal);
    if (savePaymentBtn) savePaymentBtn.addEventListener('click', savePaymentMethod);

    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');

    if (cardNumber) {
        cardNumber.addEventListener('input', function (e) {
            this.value = this.value.replace(/\D/g, '');
            formatCardNumber(this);
        });

        cardNumber.addEventListener('paste', function (e) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
            this.value = text;
            formatCardNumber(this);
        });
    }

    if (expiryDate) {
        expiryDate.addEventListener('input', function (e) {
            this.value = this.value.replace(/\D/g, '');
            formatExpiryDate(this);
        });

        expiryDate.addEventListener('paste', function (e) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
            this.value = text;
            formatExpiryDate(this);
        });
    }

    if (cvv) {
        cvv.addEventListener('input', function (e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 3);
        });
    }

    const closeCancelModalBtn = document.getElementById('closeCancelModal');
    const keepSubscriptionBtn = document.getElementById('keepSubscriptionBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');

    if (closeCancelModalBtn) closeCancelModalBtn.addEventListener('click', closeCancelModal);
    if (keepSubscriptionBtn) keepSubscriptionBtn.addEventListener('click', closeCancelModal);
    if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', cancelSubscription);

    const addPaymentModal = document.getElementById('addPaymentModal');
    if (addPaymentModal) {
        addPaymentModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeAddPaymentModal();
            }
        });
    }

    const cancelSubscriptionModal = document.getElementById('cancelSubscriptionModal');
    if (cancelSubscriptionModal) {
        cancelSubscriptionModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeCancelModal();
            }
        });
    }

    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', function () {
            if (!this.disabled) {
                window.location.href = 'pricing.html';
            }
        });
    }
});