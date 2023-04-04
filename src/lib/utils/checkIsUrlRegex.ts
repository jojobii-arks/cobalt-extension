/** URL regex */
const regexUrl = new RegExp(
  /https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/
);

export default function checkIsUrlRegex(url: string) {
  return regexUrl.test(url);
}
