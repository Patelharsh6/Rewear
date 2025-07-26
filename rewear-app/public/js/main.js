document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Navigation Menu Logic ---
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                if (navMenu.classList.contains("active")) {
                    hamburger.classList.remove("active");
                    navMenu.classList.remove("active");
                }
            });
        });
    }

    // --- "See More" Items Logic on Homepage ---
    const seeMoreBtn = document.getElementById('see-more-btn');
    const itemsGrid = document.getElementById('items-grid-container');
    if (seeMoreBtn && itemsGrid) {
        seeMoreBtn.addEventListener('click', async () => {
            let currentPage = parseInt(seeMoreBtn.dataset.page, 10);
            seeMoreBtn.textContent = 'Loading...';
            seeMoreBtn.disabled = true;
            try {
                const response = await fetch(`/api/items?page=${currentPage}`);
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    data.items.forEach(item => {
                        const itemCardHTML = `
                            <div class="item-card">
                                <a href="/items/${item._id}" class="item-card-link-image">
                                    <img src="${item.images[0].url}" alt="${item.title}" class="item-image">
                                </a>
                                <div class="item-info">
                                    <h4 class="item-title"><a href="/items/${item._id}">${item.title}</a></h4>
                                    <p class="item-uploader">from @${item.owner.username}</p>
                                    <span class="item-price">₹${item.price}</span>
                                </div>
                                <div class="item-card-actions">
                                    <form action="/cart/add/${item._id}" method="POST" class="action-form">
                                        <button type="submit" class="btn btn-secondary btn-sm">Add to Cart</button>
                                    </form>
                                </div>
                            </div>
                        `;
                        itemsGrid.insertAdjacentHTML('beforeend', itemCardHTML);
                    });
                    seeMoreBtn.dataset.page = currentPage + 1;
                    if (!data.hasMore) seeMoreBtn.style.display = 'none';
                } else {
                    seeMoreBtn.style.display = 'none';
                }
            } catch (error) {
                console.error('Failed to load more items:', error);
                seeMoreBtn.textContent = 'Failed to load';
            } finally {
                if (seeMoreBtn.style.display !== 'none') {
                    seeMoreBtn.textContent = 'See More';
                    seeMoreBtn.disabled = false;
                }
            }
        });
    }

    // --- Advanced Form Logic for Add/Edit Item Pages ---
    const itemForm = document.querySelector('.item-form');
    if (itemForm) {
        const locationData = {
            "Andaman and Nicobar Islands": {"Port Blair": ["Aberdeen Bazaar", "Phoenix Bay"]}, "Andhra Pradesh": {"Visakhapatnam": ["Gajuwaka", "MVP Colony"], "Vijayawada": ["Benz Circle", "Gandi Nagar"], "Guntur": ["Brodipet", "Lakshmipuram"], "Tirupati": ["Tirumala", "RTC Bus Stand"]}, "Arunachal Pradesh": {"Itanagar": ["Ganga Market", "Naharlagun"]}, "Assam": {"Guwahati": ["Paltan Bazaar", "Dispur"], "Dibrugarh": ["Naliapool", "Milan Nagar"]}, "Bihar": {"Patna": ["Boring Road", "Kankarbagh"], "Gaya": ["GB Road", "AP Colony"]}, "Chandigarh": {"Chandigarh": ["Sector 17", "Sector 35", "Manimajra"]}, "Chhattisgarh": {"Raipur": ["Shankar Nagar", "Civil Lines"], "Bhilai": ["Sector 10", "Civic Centre"]}, "Dadra and Nagar Haveli and Daman and Diu": {"Daman": ["Moti Daman", "Nani Daman"], "Silvassa": ["Amli", "Tokarkhada"]}, "Delhi": {"New Delhi": ["Connaught Place", "Saket", "Hauz Khas"], "North Delhi": ["Kamla Nagar", "Rohini"], "South Delhi": ["Greater Kailash", "Vasant Kunj"], "East Delhi": ["Laxmi Nagar", "Mayur Vihar"], "West Delhi": ["Rajouri Garden", "Janakpuri"]}, "Goa": {"Panaji": ["Miramar", "Dona Paula"], "Margao": ["Fatorda", "Aquem"]}, "Gujarat": {"Ahmedabad": ["Satellite", "Vastrapur", "Bodakdev", "Maninagar"], "Surat": ["Adajan", "Piplod", "Vesu"], "Vadodara": ["Alkapuri", "Fatehgunj"], "Rajkot": ["Kalawad Road", "University Road"]}, "Haryana": {"Gurugram": ["DLF Cyber City", "Sohna Road"], "Faridabad": ["Sector 15", "NIT"], "Chandigarh": ["Sector 17", "Sector 35"]}, "Himachal Pradesh": {"Shimla": ["Mall Road", "Sanjauli"], "Manali": ["Old Manali", "Aleo"]}, "Jammu and Kashmir": {"Srinagar": ["Lal Chowk", "Rajbagh"], "Jammu": ["Gandhi Nagar", "Trikuta Nagar"]}, "Jharkhand": {"Ranchi": ["Lalpur", "Doranda"], "Jamshedpur": ["Sakchi", "Bistupur"]}, "Karnataka": {"Bengaluru": ["Koramangala", "Indiranagar", "Whitefield", "Jayanagar"], "Mysuru": ["Jayalakshmipuram", "Kuvempunagar"], "Mangaluru": ["Hampankatta", "Lalbagh"]}, "Kerala": {"Kochi": ["Kakkanad", "Edappally", "Fort Kochi"], "Thiruvananthapuram": ["Technopark", "Pattom"], "Kozhikode": ["Mavoor Road", "Palayam"]}, "Ladakh": {"Leh": ["Main Bazaar", "Choglamsar"], "Kargil": ["Main Market", "Baroo"]}, "Lakshadweep": {"Kavaratti": ["Main Road", "Jetty Area"]}, "Madhya Pradesh": {"Indore": ["Vijay Nagar", "Rau"], "Bhopal": ["MP Nagar", "Arera Colony"], "Gwalior": ["Lashkar", "Morar"]}, "Maharashtra": {"Mumbai": ["Andheri", "Bandra", "Dadar", "Thane", "Navi Mumbai"], "Pune": ["Koregaon Park", "Viman Nagar", "Hinjewadi", "Deccan"], "Nagpur": ["Sadar", "Dharampeth"]}, "Manipur": {"Imphal": ["Thangal Bazar", "Paona Bazar"]}, "Meghalaya": {"Shillong": ["Police Bazar", "Laitumkhrah"]}, "Mizoram": {"Aizawl": ["Zarkawt", "Chanmari"]}, "Nagaland": {"Kohima": ["PR Hill", "Old Ministers Hill"], "Dimapur": ["Circular Road", "Signal Basti"]}, "Odisha": {"Bhubaneswar": ["Saheed Nagar", "Patia"], "Cuttack": ["Buxi Bazaar", "Link Road"]}, "Puducherry": {"Puducherry": ["White Town", "Heritage Town"]}, "Punjab": {"Ludhiana": ["Sarabha Nagar", "Model Town"], "Amritsar": ["Ranjit Avenue", "Lawrence Road"], "Chandigarh": ["Sector 17", "Sector 35"]}, "Rajasthan": {"Jaipur": ["C-Scheme", "Vaishali Nagar", "Malviya Nagar"], "Jodhpur": ["Sardarpura", "Shastri Nagar"], "Udaipur": ["Fatehpura", "Hiran Magri"]}, "Sikkim": {"Gangtok": ["MG Marg", "Tadong"]}, "Tamil Nadu": {"Chennai": ["T. Nagar", "Adyar", "Velachery", "Anna Nagar"], "Coimbatore": ["RS Puram", "Gandhipuram"], "Madurai": ["Anna Nagar", "Simmakkal"]}, "Telangana": {"Hyderabad": ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Secunderabad"]}, "Tripura": {"Agartala": ["Battala", "Paradise Chowmuhani"]}, "Uttar Pradesh": {"Lucknow": ["Hazratganj", "Gomti Nagar"], "Kanpur": ["Swaroop Nagar", "Civil Lines"], "Noida": ["Sector 18", "Sector 62"], "Agra": ["Sanjay Place", "Taj Ganj"], "Varanasi": ["Lanka", "Sigra"]}, "Uttarakhand": {"Dehradun": ["Rajpur Road", "Ballupur"], "Haridwar": ["Har Ki Pauri", "Kankhal"]}, "West Bengal": {"Kolkata": ["Park Street", "Salt Lake", "New Town", "Ballygunge"], "Howrah": ["Shibpur", "Bally"], "Darjeeling": ["Chowrasta", "Mall Road"]}
        };
        const addImageBtn = document.getElementById('add-image-btn');
        const imageUploadInput = document.getElementById('image-upload-input');
        const imagePreviewGrid = document.getElementById('image-preview-grid');
        const imagesToDeleteInput = document.getElementById('images-to-delete');
        const maxImages = 8;
        let newFiles = [];
        let existingImageCount = imagePreviewGrid ? imagePreviewGrid.querySelectorAll('.image-preview-item').length : 0;
        let imagesToDelete = [];
        function updateTotalImageCount() { return existingImageCount + newFiles.length; }
        function toggleAddButton() { if(addImageBtn) addImageBtn.style.display = updateTotalImageCount() >= maxImages ? 'none' : 'flex'; }
        toggleAddButton();
        if(addImageBtn) { addImageBtn.addEventListener('click', () => { if (updateTotalImageCount() < maxImages) imageUploadInput.click(); }); }
        if(imageUploadInput) {
            imageUploadInput.addEventListener('change', (event) => {
                const files = Array.from(event.target.files);
                const remainingSlots = maxImages - updateTotalImageCount();
                files.slice(0, remainingSlots).forEach(file => {
                    if (!newFiles.some(f => f.name === file.name)) {
                        newFiles.push(file);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const previewItem = document.createElement('div');
                            previewItem.className = 'image-preview-item is-new';
                            previewItem.innerHTML = `<img src="${e.target.result}" alt="${file.name}"><button type="button" class="remove-image-btn" data-filename="${file.name}">&times;</button>`;
                            imagePreviewGrid.appendChild(previewItem);
                        };
                        reader.readAsDataURL(file);
                    }
                });
                updateFileInputs();
                toggleAddButton();
            });
        }
        if(imagePreviewGrid) {
            imagePreviewGrid.addEventListener('click', (event) => {
                if (event.target.classList.contains('remove-image-btn')) {
                    const previewItem = event.target.parentElement;
                    const filename = event.target.dataset.filename;
                    if (previewItem.classList.contains('is-new')) {
                        newFiles = newFiles.filter(f => f.name !== filename);
                    } else {
                        const publicId = previewItem.dataset.publicId;
                        if (!imagesToDelete.includes(publicId)) imagesToDelete.push(publicId);
                        if(imagesToDeleteInput) imagesToDeleteInput.value = imagesToDelete.join(',');
                        existingImageCount--;
                    }
                    previewItem.remove();
                    updateFileInputs();
                    toggleAddButton();
                }
            });
        }
        function updateFileInputs() { const dataTransfer = new DataTransfer(); newFiles.forEach(file => dataTransfer.items.add(file)); if(imageUploadInput) imageUploadInput.files = dataTransfer.files; }
        const stateSelect = document.getElementById('state-select');
        const citySelect = document.getElementById('city-select');
        const areaSelect = document.getElementById('area-select');
        const locationGrid = document.querySelector('.location-grid');
        if(stateSelect && citySelect && areaSelect) {
            stateSelect.innerHTML = '<option value="" disabled selected>Select State</option>';
            Object.keys(locationData).sort().forEach(state => stateSelect.add(new Option(state, state)));
            stateSelect.addEventListener('change', () => {
                const selectedState = stateSelect.value;
                citySelect.innerHTML = '<option value="" disabled selected>Select City</option>';
                areaSelect.innerHTML = '<option value="" disabled selected>Select Area</option>';
                citySelect.disabled = true; areaSelect.disabled = true;
                if (selectedState && locationData[selectedState]) {
                    Object.keys(locationData[selectedState]).sort().forEach(city => citySelect.add(new Option(city, city)));
                    citySelect.disabled = false;
                }
            });
            citySelect.addEventListener('change', () => {
                const selectedState = stateSelect.value;
                const selectedCity = citySelect.value;
                areaSelect.innerHTML = '<option value="" disabled selected>Select Area</option>';
                areaSelect.disabled = true;
                if (selectedState && selectedCity && locationData[selectedState][selectedCity]) {
                    locationData[selectedState][selectedCity].sort().forEach(area => areaSelect.add(new Option(area, area)));
                    areaSelect.disabled = false;
                }
            });
            if (itemForm.classList.contains('edit-item-form')) {
                const savedState = locationGrid.dataset.state;
                const savedCity = locationGrid.dataset.city;
                const savedArea = locationGrid.dataset.area;
                if (savedState) {
                    stateSelect.value = savedState;
                    stateSelect.dispatchEvent(new Event('change'));
                    if (savedCity) {
                        citySelect.value = savedCity;
                        citySelect.dispatchEvent(new Event('change'));
                        if (savedArea) areaSelect.value = savedArea;
                    }
                }
            }
        }
        itemForm.addEventListener('submit', () => { const submitButton = itemForm.querySelector('button[type="submit"]'); if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Submitting...'; } });
    }

    // --- Chat Page Logic ---
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        const socket = io();
        const currentUserId = document.body.dataset.userId;
        const chatNavLink = document.getElementById('chat-nav-link');
        const conversationList = document.getElementById('conversation-list');
        const chatHeader = document.getElementById('chat-header');
        const chatMessages = document.getElementById('chat-messages');
        const chatInputArea = document.getElementById('chat-input-area');
        const messageForm = document.getElementById('message-form');
        const messageInput = document.getElementById('message-input');
        let activeConversationId = null;
        let activeReceiverId = null;
        async function selectConversation(convoItem) {
            document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('active'));
            convoItem.classList.add('active');
            activeConversationId = convoItem.dataset.conversationId;
            activeReceiverId = convoItem.dataset.receiverId;
            const receiverName = convoItem.dataset.receiverName;
            chatHeader.innerHTML = `<p>Chat with ${receiverName}</p>`;
            chatMessages.innerHTML = '';
            chatInputArea.style.display = 'flex';
            messageInput.focus();
            try {
                await fetch(`/chat/${activeConversationId}/read`, { method: 'POST' });
                const response = await fetch(`/chat/${activeConversationId}`);
                const messages = await response.json();
                displayMessages(messages);
                const dot = convoItem.querySelector('.notification-dot-convo');
                if(dot) dot.remove();
            } catch (error) {
                chatMessages.innerHTML = '<p>Could not load messages.</p>';
            }
        }
        function displayMessages(messages) {
            chatMessages.innerHTML = '';
            let lastDate = null;
            messages.forEach(msg => {
                const messageDate = new Date(msg.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                if (messageDate !== lastDate) {
                    const dateSeparator = document.createElement('div');
                    dateSeparator.className = 'date-separator';
                    dateSeparator.textContent = messageDate;
                    chatMessages.appendChild(dateSeparator);
                    lastDate = messageDate;
                }
                appendMessage(msg, false);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        function appendMessage(msg, scroll = true) {
            const messageElement = document.createElement('div');
            const senderId = msg.sender._id || msg.sender;
            messageElement.classList.add('message', senderId === currentUserId ? 'sent' : 'received');
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            messageElement.innerHTML = `<div class="message-bubble"><p>${msg.text}</p><span class="message-time">${time}</span></div>`;
            chatMessages.appendChild(messageElement);
            if (scroll) chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        conversationList.addEventListener('click', async (e) => {
            const convoItem = e.target.closest('.conversation-item');
            if (e.target.classList.contains('delete-convo-btn')) {
                e.stopPropagation();
                const conversationId = convoItem.dataset.conversationId;
                if (confirm('Are you sure you want to delete this chat?')) {
                    try {
                        const response = await fetch(`/chat/${conversationId}/delete`, { method: 'POST' });
                        if (response.ok) {
                            convoItem.remove();
                            if (activeConversationId === conversationId) {
                                chatHeader.innerHTML = '<p>Select a conversation</p>';
                                chatMessages.innerHTML = '<div class="no-chat-selected"><svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><p>Your messages will appear here.</p></div>';
                                chatInputArea.style.display = 'none';
                            }
                        } else { alert('Failed to delete chat.'); }
                    } catch (error) { alert('An error occurred.'); }
                }
            } else if (convoItem) {
                selectConversation(convoItem);
            }
        });
        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = messageInput.value.trim();
            if (text && activeConversationId && activeReceiverId) {
                socket.emit('sendMessage', { conversationId: activeConversationId, receiverId: activeReceiverId, text: text });
                messageInput.value = '';
            }
        });
        socket.on('newMessage', ({ conversationId, message }) => {
            if (conversationId === activeConversationId) {
                appendMessage(message);
            } else {
                if (chatNavLink && !chatNavLink.querySelector('.notification-dot')) {
                    const dot = document.createElement('span');
                    dot.className = 'notification-dot';
                    chatNavLink.appendChild(dot);
                }
            }
        });
        const urlParams = new URLSearchParams(window.location.search);
        const openConversationId = urlParams.get('open');
        if (openConversationId) {
            const convoToOpen = document.querySelector(`.conversation-item[data-conversation-id="${openConversationId}"]`);
            if (convoToOpen) selectConversation(convoToOpen);
        }
    }

    // --- Sign Up Page Password Validation Logic ---
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const lengthRule = document.getElementById('length-rule');
        const uppercaseRule = document.getElementById('uppercase-rule');
        const lowercaseRule = document.getElementById('lowercase-rule');
        const numberRule = document.getElementById('number-rule');
        const specialRule = document.getElementById('special-rule');
        const confirmMessage = document.getElementById('confirm-password-message');
        function validatePassword() {
            const password = passwordInput.value;
            lengthRule.classList.toggle('valid', password.length >= 8);
            uppercaseRule.classList.toggle('valid', /[A-Z]/.test(password));
            lowercaseRule.classList.toggle('valid', /[a-z]/.test(password));
            numberRule.classList.toggle('valid', /[0-9]/.test(password));
            specialRule.classList.toggle('valid', /[!@#$%^&*(),.?":{}|<>]/.test(password));
        }
        function validateConfirmPassword() {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            if (confirmPassword.length > 0 && password === confirmPassword) {
                confirmMessage.textContent = 'Passwords match!';
                confirmMessage.className = 'validation-rule valid';
            } else if (confirmPassword.length > 0) {
                confirmMessage.textContent = 'Passwords do not match.';
                confirmMessage.className = 'validation-rule invalid';
            } else {
                confirmMessage.textContent = '';
                confirmMessage.className = 'validation-rule';
            }
        }
        passwordInput.addEventListener('input', () => {
            validatePassword();
            validateConfirmPassword();
        });
        confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    }
});
