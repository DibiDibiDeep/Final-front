import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 날짜 및 시간 포맷팅 함수의 반환 타입을 정의
interface FormattedDateTime {
    formattedDate: string;
    formattedTime: string;
}

function formatDateTime(dateTimeString: string): FormattedDateTime {
    const date = new Date(dateTimeString);

    // 날짜 포맷: yyyy.MM.dd
    const formattedDate = format(date, 'yyyy.MM.dd', { locale: ko });

    // 시간 포맷: 오전/오후 h:mm
    // 'a'를 사용하여 오전/오후를 영어로 가져온 후, 이를 한국어로 변환
    const formattedTime = format(date, 'a h:mm', { locale: ko })
        .replace('AM', '오전')
        .replace('PM', '오후');

    return { formattedDate, formattedTime };
}

// 테스트 문자열
const dateTimeString: string = "2024-09-15T19:00:00";
const { formattedDate, formattedTime } = formatDateTime(dateTimeString);

console.log('날짜:', formattedDate);  // 출력: 2024.09.15
console.log('시간:', formattedTime);  // 출력: 오후 7:00
