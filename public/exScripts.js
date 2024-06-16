var username;
document.addEventListener('DOMContentLoaded', (event) => {

    // For Firebase JS SDK v7.20.0 and lter, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyAD1KMSpY0bYfOD1LkgqZOxJGb9mln4FnA",
        authDomain: "ncku-89f9b.firebaseapp.com",
        databaseURL: "https://ncku-89f9b-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "ncku-89f9b",
        storageBucket: "ncku-89f9b.appspot.com",
        messagingSenderId: "512584605700",
        appId: "1:512584605700:web:fc6feee0164e5126241551",
        measurementId: "G-5347400104"
      };
    
      // Initialize Firebase
      const app = firebase.initializeApp(firebaseConfig);
      const auth = app.auth();

      
  // 在用户登录状态变更时处理函数中
    auth.onAuthStateChanged(user => {
        const userDropdown = document.getElementById('userDropdown');
        const loginBtn = document.getElementById('loginBtn');

        if (user) {
            userDropdown.style.display = 'block';
            loginBtn.style.display = 'none';
            // 从 Realtime Database 中获取用户数据
            username = user.displayName; // 假设用户的显示名称已经设置为了用户名
            const userRef = firebase.database().ref(`users/${username}`);
            userRef.once('value', snapshot => {
                const userData = snapshot.val();
                if (userData && userData.username) {
                    // 如果用户数据中存在名称字段，则将其设置为按钮文本
                    document.getElementById('navbarDropdown').textContent = `Hi, ${userData.username}`;
                } else {
                    // 如果用户数据中不存在名称字段，则使用默认值
                    document.getElementById('navbarDropdown').textContent = `Hi, ${username}`;
                }
            });
        } else {
            userDropdown.style.display = 'none';
            loginBtn.style.display = 'block';
            // 如果用户未登录，恢复默认的登录按钮文本
            document.getElementById('navbarDropdown').textContent = '登入/登出';
        }
    });
    // 登出按钮点击事件处理程序
    document.getElementById('logoutBtn').addEventListener('click', () => {
        auth.signOut();
        window.location.href = "index.html";
    });

     // 你的 JavaScript 代码放在这里
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chatInput');
    const chatHistory = document.getElementById('chatHistory');
    document
    .getElementById("chatButton")
    .addEventListener("click", function () {
      const chatWindow = document.getElementById("chatWindow");
      // 切換對話框顯示狀態
      chatWindow.style.display = 
        chatWindow.style.display === "block" ? "none" : "block";
      // 填入預先定義的文字
    });

    // 根据当前页面的主机名动态确定 WebSocket 的 URL
    let wsUrl;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        wsUrl = 'ws://localhost:3000';
    } else {
        // 注意：这里你需要将 'your-app-id.REGION_ID.r.appspot.com' 替换为你的实际 App Engine 应用的 URL
        // 并且确保使用 wss 协议（安全的 WebSocket）
        wsUrl = 'wss://webavr.com/';
    }
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('Connected to the server');
    };

    ws.onmessage = (event) => {
        const message = event.data;
        console.log('Message received:', message);
        // 更新聊天历史，区分用户和机器人的消息
        displayMessage(message, "bot");
        //chatHistory.innerHTML += `<div class="message bot-message"><span>Bot:</span> ${message}</div>`;
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('Disconnected from the server');
    };

    chatForm.onsubmit = (e) => {
        e.preventDefault();
        const message = chatInput.value.trim(); // 删除输入值两端的空白字符
        if (message) {
            // 在尝试发送消息前检查 WebSocket 连接状态
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message); // 如果消息非空，通过 WebSocket 发送消息
                console.log('Message sent:', message);
                // 可选：在聊天历史中添加用户消息
                displayMessage(message, "user");
                //chatHistory.innerHTML += `<div class="message user-message"><span>You:</span> ${message}</div>`;
                chatInput.value = ''; // 清空输入框
            } else {
                console.log('WebSocket is not open. Unable to send message.');
            }
        } else {
            console.log('Empty message not sent.'); // 如果消息为空，打印日志但不发送
        }
    };

function displayMessage(message, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", `${sender}-message`);
    messageDiv.textContent = message;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to the bottom

    const now = new Date();
    const dateString = now.toISOString().split('T')[0]; // 获取日期
    const timeString = now.toTimeString().split(' ')[0]; // 获取时间
    const dateTimeString = `${dateString} ${timeString}`;

    const conversationRef = firebase.database().ref(`users/${username}/log/conversation/${dateTimeString}`);
    conversationRef.set({
        message: message,
        sender: sender,
        timestamp: dateTimeString
    }).then(() => {
        console.log('Message uploaded to database successfully!');
    }).catch(error => {
        console.error('Error uploading message to database:', error);
    });
	}
});

 // 获取所有的复制按钮
 const copyButtons = document.querySelectorAll('.copy-btn');

// 遍历每个复制按钮，并添加点击事件处理程序
copyButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 获取当前按钮相邻的 <h2> 元素的文本内容，去除前面的数字标头，并在后面添加 "How to"
        const heading = button.previousElementSibling;
        const originalText = heading.textContent;
        const textToCopy = "How to " + originalText.replace(/^\d+\.\d+\s/, '');

        // 创建一个新的 textarea 元素，并将要复制的文本放入其中
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;

        // 将 textarea 添加到页面中，并执行复制操作
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');

        // 删除 textarea 元素
        document.body.removeChild(textarea);

        // 提示用户复制成功
        alert('Text copied successfully!');

        const now = new Date();
        const dateString = now.toISOString().split('T')[0]; // 获取日期
        const timeString = now.toTimeString().split(' ')[0]; // 获取时间
        const dateTimeString = `${dateString} ${timeString}`;

        const copyTextRef = firebase.database().ref(`users/${username}/log/copyText/${dateTimeString}`);
        copyTextRef.set({
            text: textToCopy,
            time: dateTimeString
        }).then(() => {
            console.log('Copied text and time uploaded to database successfully!');
        }).catch(error => {
            console.error('Error uploading copied text and time to database:', error);
        });
    });
});
