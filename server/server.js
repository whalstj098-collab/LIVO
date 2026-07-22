// ====================
// 필요한 라이브러리
// ====================
const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

// ====================
// 서버 설정
// ====================

const app = express();

const server = http.createServer(app);

const io = new Server(server);

const PORT = 3000;

const DATA_FILE = "./data.json";

app.use(express.json());
app.use(cors());
// client 폴더의 정적 파일 제공
app.use(express.static(path.join(__dirname, "../client")));

// ====================
// JSON 데이터 관리
// ====================

// 데이터 읽기
function readData() {
  const data = fs.readFileSync(DATA_FILE, "utf-8");

  return JSON.parse(data);
}

// 데이터 저장
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
}

// ====================
// 기본 API
// ====================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// ====================
// 회원 API
// ====================

// 회원가입
app.post("/signup", (req, res) => {
  const data = readData();

  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({
      message: "이름과 비밀번호를 입력해주세요.",
    });
  }

  const existsUser = data.users.find((user) => user.name === name);

  if (existsUser) {
    return res.status(409).json({
      message: "이미 존재하는 사용자입니다.",
    });
  }

  const newUser = {
    id: Date.now(),

    name,

    password,
  };

  data.users.push(newUser);

  saveData(data);

  res.status(201).json({
    message: "회원가입 성공",

    user: newUser,
  });
});

// 로그인
app.post("/login", (req, res) => {
  const data = readData();

  const { name, password } = req.body;

  const user = data.users.find(
    (user) => user.name === name && user.password === password,
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "아이디 또는 비밀번호가 틀렸습니다.",
    });
  }

  res.json({
    success: true,
    message: "로그인 성공",
    user: {
      id: user.id,
      name: user.name,
    },
  });
});

// ====================
// 투표 API
// ====================

// 투표 목록 조회
app.get("/polls", (req, res) => {
  const data = readData();

  res.json(data.polls);
});
// 특정 투표 조회
// ===============================
// Socket.IO 연결
// ===============================

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Socket 연결 완료:", socket.id);
});

// 서버에서 투표 발생 알림 수신

socket.on("voteUpdate", (vote) => {
  console.log("실시간 투표 변경:", vote);

  // 결과 페이지일 경우 자동 갱신

  if (location.pathname.includes("result.html")) {
    resultPage();
  }
});

// ===============================
// 메인 페이지
// ===============================

async function indexPage() {
  const pollList = document.getElementById("pollList");

  if (!pollList) return;

  try {
    const polls = await request("/polls");

    pollList.innerHTML = "";

    if (polls.length === 0) {
      pollList.innerHTML = `

        <p class="message">
          등록된 투표가 없습니다.
        </p>

      `;

      return;
    }

    polls.forEach((poll) => {
      const card = document.createElement("div");

      card.className = "poll-card";

      card.innerHTML = `


        <h3>
          ${poll.title}
        </h3>



        <p>
          선택지 :
          ${poll.options.join(", ")}
        </p>



        <button
          onclick="
          location.href='vote.html?id=${poll.id}'
          ">

          투표하기

        </button>




        <button
          onclick="
          location.href='result.html?id=${poll.id}'
          ">

          결과 보기

        </button>



      `;

      pollList.appendChild(card);
    });
  } catch (error) {
    console.error("투표 목록 오류", error);

    alert("투표 목록을 불러오지 못했습니다.");
  }
}

// ===============================
// 결과 페이지
// ===============================

async function resultPage() {
  const resultList = document.getElementById("resultList");

  if (!resultList) return;

  // URL에서 투표 id 가져오기

  const params = new URLSearchParams(location.search);

  const pollId = params.get("id");

  if (!pollId) {
    alert("투표 정보가 없습니다.");

    location.href = "index.html";

    return;
  }

  try {
    const result = await request(`/polls/${pollId}/result`);

    const title = document.getElementById("resultTitle");

    if (title) {
      title.textContent = result.title;
    }

    resultList.innerHTML = "";

    result.results.forEach((item) => {
      resultList.innerHTML += `


        <div class="result-card">


          <h3>

            ${item.option}

          </h3>



          <p>

            득표수 :
            ${item.count}표

          </p>



        </div>


      `;
    });
  } catch (error) {
    console.error("결과 조회 오류", error);

    alert("결과를 불러오지 못했습니다.");
  }
}
