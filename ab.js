const proxyUrl = "https://broken-star-6439.abrahamdw882.workers.dev/?u=";
let activeUploads = 0;
let questionHistory = {};

document.getElementById('fileInput').addEventListener('change', function (e) {
  const files = e.target.files;
  displayFileName(files);
  uploadFiles(files);
});

const dropZone = document.getElementById('dropZone');

dropZone.ondragover = e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
};

dropZone.ondragleave = () => dropZone.classList.remove('dragover');

dropZone.ondrop = e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = e.dataTransfer.files;
  displayFileName(files);
  uploadFiles(files);
};

function displayFileName(files) {
  if (files.length > 0) {
    document.getElementById('fileName').textContent = `Selected File: ${files[0].name}`;
  }
}

function showUploadingIndicator() {
  document.getElementById('uploadingIndicator').style.display = 'block';
}

function hideUploadingIndicator() {
  document.getElementById('uploadingIndicator').style.display = 'none';
}

function uploadFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      alert("Only image files are allowed.");
      continue;
    }
    activeUploads++;
    showUploadingIndicator();

    const formData = new FormData();
    formData.append('image', file);

    fetch('upload.php', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          displayImage(data.url);
        } else {
          alert("Upload failed: " + data.error);
        }
      })
      .catch(error => {
        console.error("Error uploading file:", error);
      })
      .finally(() => {
        activeUploads--;
        if (activeUploads === 0) {
          hideUploadingIndicator();
        }
      });
  }
}

function displayImage(imageUrl) {
  const container = document.createElement('div');
  container.classList.add('preview-container');

  const uniqueId = `question-${Math.random().toString(36).substring(2, 15)}`;

  container.innerHTML = `
    <h3>Uploaded Image</h3>
    <img class="preview" src="${imageUrl}">
    <div class="ai-query">
      <input type="text" id="${uniqueId}" 
             placeholder="Ask a question about the image..." 
             value="Describe this image in detail">
      <button onclick="askAI('${uniqueId}', '${imageUrl}')">Analyze</button>
    </div>
    <div class="ai-response" id="response-${imageUrl}"></div>
    <div class="file-link">
      <input type="text" value="${imageUrl}" readonly>
      <button onclick="copyToClipboard(this)">Copy</button>
    </div>
  `;
  document.getElementById('previews').appendChild(container);
}

marked.setOptions({
  breaks: true,
  highlight: function(code) {
    return hljs.highlightAuto(code).value;
  }
});

async function askAI(questionId, imageUrl) {
    const questionInput = document.getElementById(questionId);
    const responseDiv = document.getElementById(`response-${imageUrl}`);
    const question = questionInput.value.trim();

    if (!question) {
        responseDiv.innerHTML = `<div class="error-message">
            <strong>⚠️ Please enter a question before analyzing.</strong>
        </div>`;
        return;
    }

    if (!questionHistory[imageUrl]) {
        questionHistory[imageUrl] = [];
    }
    questionHistory[imageUrl].push(question);

    responseDiv.className = 'ai-response loading';
    responseDiv.innerHTML = `
        <div class="loading">
            <span>Analyzing image...</span>
            <div class="loading-dots"></div>
        </div>
    `;
    try {
        const encodedQuestion = encodeURIComponent(question);
        const bk9Url = `https://bk9.fun/ai/geminiimg?url1=${encodeURIComponent(imageUrl)}&q=${encodedQuestion}`;

        console.log("AB API Request: is working fine :)");
        let response = await fetch(bk9Url);

        if (!response.ok) throw new Error(`BK9 API Error: ${response.status}`);

        let data = await response.json();
        console.log("API Response: up hehe");

        if (data.status && data.BK9) {
            responseDiv.className = 'ai-response success';
            responseDiv.innerHTML = `
                <div class="response-header">
                    <span class="ai-icon">🧠</span>
                    <h4>AI Analysis Result</h4>
                </div>
                <div class="markdown-body">${DOMPurify.sanitize(marked.parse(data.BK9))}</div>
            `;
            return;
        }

        throw new Error(" API returned an empty response.");
    } catch (error) {
        console.warn(" API failed, switching to backup AI:", error);
    }
    try {
        const conversationHistory = questionHistory[imageUrl].map(q => ({
            role: "user", content: q
        }));

        const apiUrl = "https://fgsi-ai.hf.space/";
        const requestData = {
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                ...conversationHistory, 
                { 
                    role: "user", 
                    content: [
                        { type: "image_url", image_url: { url: imageUrl } },
                        { type: "text", text: question }
                    ] 
                }
            ],
            temperature: 1,
            max_tokens: 1000,
            top_p: 1
        };

        response = await fetch(proxyUrl + encodeURIComponent(apiUrl), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) throw new Error(`Old API Error: ${response.status}`);

        data = await response.json();
        console.log("API Response:",data);

        if (data.status && data.data && data.data.prompt) {
            const parsedHTML = marked.parse(data.data.prompt);
            const sanitizedHTML = DOMPurify.sanitize(parsedHTML);

            responseDiv.className = 'ai-response success';
            responseDiv.innerHTML = `
                <div class="response-header">
                    <span class="ai-icon">🧠</span>
                    <h4>AI Analysis Result</h4>
                </div>
                <div class="markdown-body">${sanitizedHTML}</div>
            `;
        } else {
            throw new Error("Empty response from Old API.");
        }
    } catch (error) {
        console.error("AI Error:", error);
        responseDiv.className = 'ai-response error';
        responseDiv.innerHTML = `<div class="error-message">
            <strong>⚠️ Analysis Failed:</strong> ${error.message}
        </div>`;
    }
}

function copyToClipboard(button) {
  const input = button.previousElementSibling;
  input.select();
  document.execCommand('copy');
  button.textContent = '✅ Copied!';
  setTimeout(() => button.textContent = 'Copy', 2000);
}
