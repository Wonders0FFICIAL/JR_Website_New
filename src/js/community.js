document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    
    const communityBtns = document.querySelectorAll('.community-btn');
    communityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const buttonText = this.textContent;
            let url;
            
            switch(buttonText) {
                case 'Join Discord':
                    url = 'https://discord.gg/d4kfXDrcG8';
                    break;
                case 'Visit GitHub':
                    url = 'https://github.com/jr-official';
                    break;
                case 'Browse Forums':
                    url = 'https://forums.jrofficial.org';
                    break;
                default:
                    url = '#';
            }
            
            window.open(url, '_blank');
        });
    });

    const registerBtns = document.querySelectorAll('.register-btn');
    registerBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventName = this.closest('.event-details').querySelector('h3').textContent;
            alert(`Registration for "${eventName}" will open in a new tab.`);
        });
    });

    const subscribeBtn = document.querySelector('.subscribe-btn');
    const emailInput = document.querySelector('.email-input');
    
    subscribeBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        if (email === '') {
            alert('Please enter your email address.');
            return;
        }
        
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        

        alert(`Thank you! Your email ${email} has been subscribed to our newsletter.`);
        emailInput.value = '';
    });

    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
});