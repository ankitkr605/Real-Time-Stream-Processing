document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('tweetInput');
    const submitBtn = document.getElementById('submitBtn');
    const feed = document.getElementById('feedStream');
    const sidebarTweetBtn = document.getElementById('sidebarTweetBtn');

    // ==========================================
    // 1. Handle Input State
    // ==========================================
    input.addEventListener('input', () => {
        if (input.value.trim().length > 0) {
            submitBtn.classList.add('active');
            submitBtn.disabled = false;
        } else {
            submitBtn.classList.remove('active');
            submitBtn.disabled = true;
        }
    });

    // ==========================================
    // 2. Handle Submit Button Click
    // ==========================================
    submitBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) return;

        // Reset input immediately for better UX
        input.value = '';
        submitBtn.classList.remove('active');
        submitBtn.disabled = true;

        // Show loading state
        submitBtn.textContent = '...';
        
        try {
            // Send to Backend
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });

            const data = await response.json();

            // Reset button text
            submitBtn.textContent = 'Tweet';

            if (response.ok) {
                addTweetToFeed(data);
            } else {
                alert('Error: ' + (data.error || 'Unknown error occurred'));
            }
        } catch (error) {
            console.error('Error:', error);
            submitBtn.textContent = 'Tweet';
            alert('Failed to connect to server. Please try again.');
        }
    });

    // ==========================================
    // 3. Sidebar Tweet Button (focuses input)
    // ==========================================
    sidebarTweetBtn.addEventListener('click', () => {
        input.focus();
    });

    // ==========================================
    // 4. Enter key to submit (Ctrl+Enter for new line)
    // ==========================================
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            if (submitBtn.classList.contains('active')) {
                submitBtn.click();
            }
        }
    });

    // ==========================================
    // 5. Render Function
    // ==========================================
    function addTweetToFeed(data) {
        const sentimentClass = data.sentiment || 'Neutral';
        
        const tweetHtml = `
            <div class="tweet">
                <div class="avatar"></div>
                <div class="tweet-content">
                    <div class="tweet-header">
                        <div class="user-info">
                            <span class="name">User</span>
                            <span class="handle">@user</span>
                            <span class="time">· ${data.timestamp}</span>
                        </div>
                        <div class="sentiment-badge ${sentimentClass}">${sentimentClass}</div>
                    </div>
                    <div class="tweet-text">${escapeHtml(data.text)}</div>
                    <div class="tweet-footer">
                        <i class="far fa-comment" title="Reply"></i>
                        <i class="fas fa-retweet" title="Retweet"></i>
                        <i class="far fa-heart" title="Like"></i>
                        <i class="far fa-share-square" title="Share"></i>
                    </div>
                </div>
            </div>
        `;

        // Prepend to feed (newest first)
        feed.insertAdjacentHTML('afterbegin', tweetHtml);
    }

    // ==========================================
    // 6. Escape HTML to prevent XSS
    // ==========================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==========================================
    // 7. Check model status on load
    // ==========================================
    fetch('/health')
        .then(response => response.json())
        .then(data => {
            console.log('Model status:', data.status, '-', data.message);
        })
        .catch(error => {
            console.warn('Could not check model status:', error);
        });

    // ==========================================
    // 8. Viral Predictor Navigation Toggle
    // ==========================================
    const navHome = document.getElementById('navHome');
    const navViral = document.getElementById('navViral');
    
    const feedHeader = document.getElementById('feedHeader');
    const viralHeader = document.getElementById('viralHeader');
    
    const tweetBox = document.querySelector('.tweet-box');
    const feedStream = document.getElementById('feedStream');
    const viralStream = document.getElementById('viralStream');
    
    navHome.addEventListener('click', (e) => {
        e.preventDefault();
        navHome.classList.add('active');
        navViral.classList.remove('active');
        
        feedHeader.style.display = 'flex';
        viralHeader.style.display = 'none';
        
        tweetBox.style.display = 'flex';
        feedStream.style.display = 'block';
        viralStream.style.display = 'none';
    });
    
    navViral.addEventListener('click', (e) => {
        e.preventDefault();
        navViral.classList.add('active');
        navHome.classList.remove('active');
        
        feedHeader.style.display = 'none';
        viralHeader.style.display = 'flex';
        
        tweetBox.style.display = 'none';
        feedStream.style.display = 'none';
        viralStream.style.display = 'block';
    });

    // ==========================================
    // 9. Viral Predictor Logic
    // ==========================================
    const predictViralBtn = document.getElementById('predictViralBtn');
    
    predictViralBtn.addEventListener('click', async () => {
        const likes = document.getElementById('viralLikes').value;
        const comments = document.getElementById('viralComments').value;
        const shares = document.getElementById('viralShares').value;
        const time = document.getElementById('viralTime').value;
        
        // Basic validation
        if(likes === '' || comments === '' || shares === '' || time === '') {
            alert('Please fill in all fields to predict virality.');
            return;
        }

        predictViralBtn.textContent = 'Predicting...';
        predictViralBtn.disabled = true;

        try {
            const response = await fetch('/predict_viral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    likes: likes,
                    comments: comments,
                    shares: shares,
                    posting_time: time
                })
            });

            const data = await response.json();
            predictViralBtn.textContent = 'Predict';
            predictViralBtn.disabled = false;

            if (response.ok) {
                document.getElementById('viralResult').style.display = 'flex';
                
                const rfBadge = document.getElementById('rfResultBadge');
                const gbBadge = document.getElementById('gbResultBadge');
                
                // Update RF badge
                rfBadge.textContent = data.rf_prediction;
                rfBadge.className = 'sentiment-badge ' + (data.rf_prediction === 'Viral' ? 'Positive' : 'Neutral');
                
                // Update GB badge
                gbBadge.textContent = data.gb_prediction;
                gbBadge.className = 'sentiment-badge ' + (data.gb_prediction === 'Viral' ? 'Positive' : 'Neutral');
                
            } else {
                alert('Error: ' + (data.error || 'Unknown error occurred'));
            }
        } catch (error) {
            console.error('Error:', error);
            predictViralBtn.textContent = 'Predict';
            predictViralBtn.disabled = false;
            alert('Failed to connect to server. Please try again.');
        }
    });
});
