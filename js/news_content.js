    import { firebaseConfig } from './js/firebase.js';
    import { API_KEY } from "./js/chatgpt.js";
    import { NEWS_API_KEY } from "./js/newsapi.js";

    var url = `https://newsapi.org/v2/everything?` +
              `q=幼児&` +
              `from=2024-02-25&` +
              `sortBy=popularity&` +
              `apiKey=${NEWS_API_KEY}`;

    fetch(url)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        let a = ''; 
        let b = '';
        for(let i=0; i<data.articles.length; i++){
          let article = data.articles[i];

          const originalDateTime = article.publishedAt;
          const dateObj = new Date(originalDateTime);
          const formattedDateTime = new Intl.DateTimeFormat('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
          }).format(dateObj);

          a += `<div class="article">`;
          a += `<h2>${article.title}</h2>`;
          a += `<p class="date">${formattedDateTime}</p>`;
          a += `<p class="eyecatch"><img src="${article.urlToImage}""></p>`;
          a += `<p class="next_btn"><a href="${article.url}" target="_blank">続きはこちら</a></p>`;
          a += `<p class="summary_btn"><a href="" id="summarize" data-index="${i}">要約を見る</a></p>`;
          a += '</div>';

          a += `<div id="popup" style="display:none;">`;
          a += `<p id="summary-content">ここに要約</p>`;
          a += `<button id="close">閉じる</button>`;
          a += `</div>`
        }
        
        $('#output').html(a);

        async function gptSummary(description) {
        const URL = "https://api.openai.com/v1/chat/completions";
        try {
          const response = await axios.post(
            URL,
            {
              "model": "gpt-3.5-turbo",
              "max_tokens": 100,
              "messages": [
                { "role": "user", "content": description + '簡潔に要約すること' }
              ]
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`
              }
            }
          );
          return response.data.choices[0].message.content;
        } catch (error) {
          console.error("エラーが発生しました: ", error);
          return '';
        }
      }

      $(document).on('click', '.summary_btn a', async function(e) { // 要約ボタンに一意なクラスまたはデータ属性を割り当てる
        e.preventDefault();

        let index = $(this).data("index");
        let description = data.articles[index].description;
        let chatgpt_response = await gptSummary(description); // 非同期関数からの戻り値を待ちます

        $('#popup').show();
        $('#summary-content').html(chatgpt_response);
      });