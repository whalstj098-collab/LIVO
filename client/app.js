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
    signupPage();
    break;

  case "login.html":
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
    indexPage();
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

// 로그인 여부 확인
function checkLogin() {
  const user = localStorage.getItem("user");

  // 로그인 정보가 없으면 로그인 페이지로 이동
  if (!user) {
    alert("로그인이 필요합니다.");

    location.href = "login.html";

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
function signupPage() {}

// 로그인 페이지
function loginPage() {}

// 메인 페이지
function indexPage() {}

// 투표 생성 페이지
function createPage() {
  // 로그인 여부 확인
  if (!checkLogin()) return;
}

// 결과 페이지
function resultPage() {
  // 로그인 여부 확인
  if (!checkLogin()) return;
}
