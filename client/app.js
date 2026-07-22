// ===============================
// LIVO Front-End
// 공통 설정 및 페이지 분기
// ===============================

// 서버 주소
const BASE_URL = "http://localhost:3000";

// Socket.IO 연결
// (socket.io.js가 포함된 페이지에서만 실행)
let socket = null;

if (typeof io !== "undefined") {
  socket = io(BASE_URL);
}

// 현재 열린 페이지 이름 가져오기
const currentPage = window.location.pathname.split("/").pop();

// ===============================
// 페이지별 함수 실행
// ===============================

switch (currentPage) {
  case "signup.html":
    updateMenu();
    signupPage();
    break;

  case "login.html":
    updateMenu();
    loginPage();
    break;

  case "create.html":
    createPage();
    break;

  case "result.html":
    resultPage();
    break;

  case "index.html":
  case "":
    updateMenu();
    indexPage();
    break;

  case "vote.html":
    votePage();

    break;
}

// ===============================
// 공통 함수
// ===============================

// 서버 요청 함수
async function request(url, method = "GET", data = null) {
  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // POST, PUT 요청일 경우 데이터 추가
  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(BASE_URL + url, options);

  return response.json();
}

// ===============================
// 로그인 여부 확인
// ===============================
function checkLogin() {
  const user = localStorage.getItem("user");

  // 로그인 정보가 없으면 로그인 페이지로 이동
  if (!user) {
    window.location.href = "login.html";

    return false;
  }

  return true;
}

// 현재 로그인한 사용자 정보 가져오기
function getLoginUser() {
  return JSON.parse(localStorage.getItem("user"));
}

// 로그아웃
function logout() {
  // 로그인 정보 삭제
  localStorage.removeItem("user");

  alert("로그아웃되었습니다.");

  location.href = "login.html";
}

// URL 파라미터 가져오기
// 예) result.html?id=3
function getQuery(name) {
  const params = new URLSearchParams(location.search);

  return params.get(name);
}

// ===============================
// 페이지 함수
// ===============================

// 회원가입 페이지
function signupPage() {
  // 이미 로그인한 경우 메인으로 이동
  if (localStorage.getItem("user")) {
    location.href = "index.html";

    return;
  }
  // 회원가입 폼 가져오기
  const signupForm = document.getElementById("signupForm");

  // 회원가입 페이지가 아니면 종료
  if (!signupForm) return;

  // 폼 제출 이벤트
  signupForm.addEventListener("submit", async function (event) {
    // 새로고침 방지
    event.preventDefault();

    // 입력값 가져오기
    const name = document.getElementById("signupName").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    // 입력값 확인
    if (name === "" || password === "") {
      alert("이름과 비밀번호를 입력하세요.");
      return;
    }

    try {
      // 회원가입 요청
      const result = await request("/signup", "POST", {
        name,
        password,
      });

      // 서버 응답 출력
      alert(result.message);

      // 회원가입 성공 시 로그인 페이지로 이동
      if (result.success) {
        location.href = "login.html";
      }
    } catch (error) {
      console.error(error);

      alert("회원가입 중 오류가 발생했습니다.");
    }
  });
}

// 로그인 페이지
function loginPage() {
  // 이미 로그인한 경우 메인 페이지로 이동
  if (localStorage.getItem("user")) {
    location.href = "index.html";
    return;
  }

  // 로그인 폼 가져오기
  const loginForm = document.getElementById("loginForm");

  // 로그인 페이지가 아니면 종료
  if (!loginForm) return;

  // 폼 제출 이벤트
  loginForm.addEventListener("submit", async function (event) {
    // 새로고침 방지
    event.preventDefault();

    // 입력값 가져오기
    const name = document.getElementById("loginName").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    // 입력값 확인
    if (name === "" || password === "") {
      alert("이름과 비밀번호를 입력하세요.");
      return;
    }

    try {
      // 로그인 요청
      const result = await request("/login", "POST", {
        name,
        password,
      });

      // 로그인 성공
      if (result.success) {
        // 로그인 정보 저장
        localStorage.setItem("user", JSON.stringify(result.user));

        alert(result.message);

        // 메인 페이지 이동
        location.href = "index.html";

        return;
      }

      // 로그인 실패
      alert(result.message);
    } catch (error) {
      console.error(error);

      alert("로그인 중 오류가 발생했습니다.");
    }
  });
}

// ===============================
// 메인 페이지
// ===============================
// ===============================
// 메인 페이지 (투표 목록)
// ===============================

async function indexPage() {
  const pollList = document.getElementById("pollList");

  // index.html이 아니면 종료
  if (!pollList) return;

  try {
    // 투표 목록 요청
    const polls = await request("/polls");

    // 초기화
    pollList.innerHTML = "";

    // 투표 없음
    if (polls.length === 0) {
      pollList.innerHTML = `
        <p class="message">
          등록된 투표가 없습니다.
        </p>
      `;

      return;
    }

    // 투표 카드 생성
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
          onclick="location.href='vote.html?id=${poll.id}'">
          투표하기
        </button>



        <button
          onclick="location.href='result.html?id=${poll.id}'">
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

  // URL에서 id 가져오기

  const params = new URLSearchParams(location.search);

  const pollId = params.get("id");

  if (!pollId) {
    alert("투표 정보가 없습니다.");

    location.href = "index.html";

    return;
  }

  try {
    // 결과 요청

    const result = await request(`/polls/${pollId}/result`);

    // 제목 출력

    const title = document.getElementById("resultTitle");

    if (title) {
      title.textContent = result.title;
    }

    // 기존 결과 삭제

    resultList.innerHTML = "";

    // 결과 출력

    result.options.forEach((option) => {
      resultList.innerHTML += `

          <div class="result-card">


            <h3>
              ${option.name}
            </h3>


            <p>
              득표수 :
              ${option.count}표
            </p>


          </div>

        `;
    });
  } catch (error) {
    console.error("결과 조회 오류", error);

    alert("결과를 불러오지 못했습니다.");
  }
}

// ===============================
// 투표 생성 페이지
// ===============================
function createPage() {
  // 로그인 여부 확인
  if (!checkLogin()) return;

  // 투표 생성 폼 가져오기
  const pollForm = document.getElementById("pollForm");

  // create.html이 아니면 종료
  if (!pollForm) return;

  // 폼 제출 이벤트
  pollForm.addEventListener("submit", async function (event) {
    // 새로고침 방지
    event.preventDefault();

    // 입력값 가져오기
    const title = document.getElementById("title").value.trim();

    const optionText = document.getElementById("options").value.trim();

    // 입력값 확인
    if (title === "" || optionText === "") {
      alert("제목과 선택지를 입력하세요.");

      return;
    }

    // 쉼표 기준으로 선택지 분리
    const options = optionText
      .split(",")
      .map((option) => option.trim())
      .filter((option) => option !== "");

    // 선택지는 최소 2개
    if (options.length < 2) {
      alert("선택지는 2개 이상 입력하세요.");

      return;
    }

    try {
      // 서버에 투표 생성 요청
      const result = await request("/polls", "POST", {
        title,
        options,
      });

      alert(result.message);

      // 생성 성공 시 메인으로 이동
      location.href = "index.html";
    } catch (error) {
      console.error(error);

      alert("투표 생성 중 오류가 발생했습니다.");
    }
  });
}

// ===============================
// 로그아웃
// ===============================
function logout() {
  // 로그인 정보 삭제
  localStorage.removeItem("user");

  alert("로그아웃되었습니다.");

  // 메인 페이지로 이동
  window.location.href = "index.html";
}

// ===============================
// 메뉴 상태 변경
// ===============================
function updateMenu() {
  const loginMenu = document.getElementById("loginMenu");
  const signupMenu = document.getElementById("signupMenu");
  const logoutBtn = document.getElementById("logoutBtn");

  const isLogin = localStorage.getItem("user");

  if (isLogin) {
    if (loginMenu) loginMenu.style.display = "none";
    if (signupMenu) signupMenu.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if (loginMenu) loginMenu.style.display = "inline-block";
    if (signupMenu) signupMenu.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

// ===============================
// 투표 페이지
// ===============================
async function votePage() {
  // 로그인 확인
  if (!checkLogin()) return;

  const voteForm = document.getElementById("voteForm");

  if (!voteForm) return;

  // 주소에서 id 가져오기
  const params = new URLSearchParams(location.search);

  const pollId = params.get("id");

  try {
    // 투표 정보 가져오기
    const poll = await request(`/polls/${pollId}`);

    // 제목 표시
    document.getElementById("pollTitle").textContent = poll.title;

    const optionList = document.getElementById("optionList");

    // 선택지 생성
    poll.options.forEach((option) => {
      optionList.innerHTML += `

            <label>

                <input 
                    type="radio"
                    name="option"
                    value="${option}"
                >

                ${option}

            </label>

            <br>

            `;
    });

    // 투표 버튼
    voteForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const selected = document.querySelector("input[name='option']:checked");

      if (!selected) {
        alert("선택지를 선택하세요.");

        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));

      const result = await request(`/polls/${pollId}/vote`, "POST", {
        userName: user.name,

        option: selected.value,
      });

      alert(result.message);

      location.href = `result.html?id=${pollId}`;
    });
  } catch (error) {
    console.error(error);

    alert("투표 정보를 불러오지 못했습니다.");
  }
}
