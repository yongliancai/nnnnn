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
                enterReportTime();
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

    function enterReportTime(){
        let reportTime = prompt("請輸入報告時間（分鐘）:");
        reportTime = parseInt(reportTime) * 60; // 轉換成秒
        
        let timePassed = 0;
        let navbar = document.querySelector('.navbar');
        let timeDisplay = document.getElementById('remainingTime'); // 獲取剩餘時間顯示元素
        
        const now = new Date();
        const dateString = now.toISOString().split('T')[0]; // 获取日期
        const timeString = now.toTimeString().split(' ')[0]; // 获取时间
        const dateTimeString = `${dateString} ${timeString}`;
    
        const reportRef = firebase.database().ref(`users/${username}/log/reportTime/${dateTimeString}`);
        reportRef.set({
            inputTime: reportTime,
            uploadTime: dateTimeString
        }).then(() => {
            console.log('Report time uploaded to database successfully!');
        }).catch(error => {
            console.error('Error uploading report time to database:', error);
        });
        
        const timer = setInterval(function() {
            timePassed += 1;
            let timeLeft = reportTime - timePassed;
            let timeFraction = timePassed / reportTime;
        
            // 更新導航欄顏色
            if (timeFraction <= 1/3) {
                navbar.style.setProperty('background-color', '#28a745', 'important');
            } else if (timeFraction <= 2/3) {
                navbar.style.setProperty('background-color', '#ffc107', 'important');
            } else {
                navbar.style.setProperty('background-color', '#dc3545', 'important');
            }

        
            // 更新剩餘時間顯示
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timeDisplay.textContent = `剩餘時間：${minutes}分${seconds}秒`;
        
            // 時間結束
            if (timeLeft <= 0) {
                clearInterval(timer);
                timeDisplay.textContent = "時間到！";
                const now = new Date();
                const dateString = now.toISOString().split('T')[0]; // 获取日期
                const timeString = now.toTimeString().split(' ')[0]; // 获取时间
                const dateTimeString = `${dateString} ${timeString}`;
                reportRef.set({
                    timesUp: "timesUp",
                    timeStamp: dateTimeString
                }).then(() => {
                    console.log('Report time uploaded to database successfully!');
                }).catch(error => {
                    console.error('Error uploading report time to database:', error);
                });
            }
        }, 1000);
    }
    

    


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
        wsUrl = 'wss://nckuchat.online//';
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

let recordingInterval = {}; // 用于存储各个录音按钮的计时器

function startRecording(buttonId) {
    const button = document.getElementById(`recordButton${buttonId}`);
    const isRecording = button.dataset.recording === 'true';
    const recordingTime = document.getElementById(`recordingTime${buttonId}`);
    const audioLink = document.getElementById(`audioLink${buttonId}`);

    if (isRecording) {
        console.log('Recording already in progress, ignoring startRecording');
        return;
    }
    const chunks = [];
    recordingTime.style.display = 'block';
    recordingTime.innerHTML = '00:00:00';
    let startTime = Date.now();
    
    console.log("Starting new recording session for button:", buttonId);
    
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        alert("MediaStream obtained:", stream);
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
        let recorder;

        try {
            recorder = new MediaRecorder(stream, { mimeType });
        } catch (error) {
            console.error("Error initializing recorder:", error);
            alert("Error initializing recorder:", error);
            return;
        }

        
        recordingInterval[buttonId] = setInterval(function() {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = elapsed % 60;
            recordingTime.innerHTML = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }, 1000);

        recorder.ondataavailable = e => chunks.push(e.data);

        recorder.onstop = () => {
            clearInterval(recordingInterval[buttonId]);
            recordingTime.style.display = 'none';
            const blob = new Blob(chunks, { type: mimeType });
            const storageRef = firebase.storage().ref();
            const audioRef = storageRef.child(`recordings/${Date.now()}.${mimeType.split('/')[1]}`);
            audioRef.put(blob)
            .then(() => audioRef.getDownloadURL())
            .then(url => {
                audioLink.innerHTML = `<a href="${url}" target="_blank">Listen to the recording</a>`;
                console.log("Recording URL set in page.");
            })
            .catch(error => {
                console.error("Error during recording upload or URL retrieval:", error);
            });
        };

        recorder.start();
        button.dataset.recording = 'true';
        button.innerHTML = 'Stop Recording';
        button.onclick = () => stopRecording(recorder, button, buttonId);
    })
    .catch(error => {
        console.error("Error accessing user media:", error);
    });
}

function stopRecording(recorder, button, buttonId) {
    recorder.stop();
    button.dataset.recording = 'false';
    button.innerHTML = 'Start Recording';
    button.onclick = () => startRecording(buttonId);
    console.log('Recording stopped.');
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

 // 获取所有的复制按钮
 const copyButtons = document.querySelectorAll('.copy-btn');

// 遍历每个复制按钮，并添加点击事件处理程序
copyButtons.forEach(button => {
    button.addEventListener('click', () => {
        const heading = button.previousElementSibling;
        const originalText = heading.textContent;
        const textToCopy = originalText;

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
