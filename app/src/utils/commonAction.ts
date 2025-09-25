/**
 * 한글 단어 뒤에 오는 조사를 결정하는 함수 (이/가)
 * @param word 조사 앞의 단어
 * @returns '이' 또는 '가'
 */
const getPostposition = (word: string): string => {
    const lastChar = word.charCodeAt(word.length - 1);
    // 한글 음절 범위이고 받침(종성)이 있는지 확인
    if (lastChar >= 0xac00 && lastChar <= 0xd7a3) {
        return (lastChar - 0xac00) % 28 > 0 ? "이" : "가";
    }
    return "가";
};

export {
    getPostposition
}