const API_URL = "http://localhost:3000";

// 투표 목록 가져오기

async function loadPolls() {
  const response = await fetch(`${API_URL}/polls`);

  const polls = await response.json();

  const pollList = document.getElementById("pollList");

  pollList.innerHTML = "";

  polls.forEach((poll) => {
    const div = document.createElement("div");

    div.className = "poll";

    div.innerHTML = `

            <h3>
                ${poll.title}
            </h3>

            <p>
                투표 ID : ${poll.id}
            </p>

        `;

    pollList.appendChild(div);
  });
}

loadPolls();
