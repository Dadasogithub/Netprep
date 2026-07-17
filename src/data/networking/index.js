import fundamentals from "./fundamentals";
import osiTcpip from "./osiTcpip";
import addressing from "./addressing";
import routingSwitching from "./routingSwitching";
import transportApp from "./transportApp";
import security from "./security";
import wanWireless from "./wanWireless";
import cloudSdn from "./cloudSdn";
import scenarios from "./scenarios";

// Master question bank — combined from all topic modules.
// Each question conforms to the shared schema documented in src/services/questionService.js
const allQuestions = [
  ...fundamentals,
  ...osiTcpip,
  ...addressing,
  ...routingSwitching,
  ...transportApp,
  ...security,
  ...wanWireless,
  ...cloudSdn,
  ...scenarios,
];

export default allQuestions;
