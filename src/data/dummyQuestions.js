// src/data/dummyQuestions.js
export const dummyQuestions = [
  {
    id: 1,
    quiz_id: 1,
    question_text: 'HTTPS 프로토콜에서 기본 포트 번호는 무엇인가요?',
    options: {
      A: '80',
      B: '443',
      C: '21',
      D: '22',
    },
    hint: '보안 계층(SSL/TLS)을 사용하는 웹 통신이에요.',
  },
  {
    id: 2,
    quiz_id: 1,
    question_text: 'OSI 7계층에서 전송 계층에 해당하는 프로토콜은?',
    options: {
      A: 'HTTP, HTTPS',
      B: 'IP, ICMP',
      C: 'TCP, UDP',
      D: 'DNS, DHCP',
    },
    hint: '데이터 전송의 신뢰성과 순서를 담당합니다.',
  },
  {
    id: 3,
    quiz_id: 1,
    question_text: '암호화되지 않은 평문 통신을 하는 프로토콜은?',
    options: {
      A: 'HTTPS',
      B: 'SSH',
      C: 'HTTP',
      D: 'TLS',
    },
    hint: '보안 연결이 적용되지 않은 웹 통신이에요.',
  },
]
