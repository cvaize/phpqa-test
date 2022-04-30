const fs = require('fs');
const HTMLParser = require('node-html-parser');
const average = function (nums) {
    return nums.reduce((a, b) => (a + b)) / nums.length;
}

let phpmetrics = fs.readFileSync('/analysis/code/phpmetrics.html', 'utf-8');
let root = HTMLParser.parse(phpmetrics);
let rows = root.querySelectorAll('#score table tbody tr');
let scores = [];

let replaceEnToRu = {
    'Maintainability': 'Ремонтопригодность',
    'Accessibility for new developers': 'Доступность для новых разработчиков',
    'Simplicity of algorithms': 'Простота алгоритмов',
    'Volume': 'Объем',
    'Reducing bug&#039;s probability': 'Снижение вероятности ошибки',
}

for (let i = 0; i < rows.length; i++) {
    let cols = rows[i].querySelectorAll('td');
    console.log(replaceEnToRu[cols[0].innerText] + ' - ' + cols[1].innerText);
    let score = Number(cols[1].innerText.split('/')[0].trim());
    scores.push(score);
}
let averageScore = Math.round(average(scores)*100)/100;

console.log('\nФинальная оценка - ' + averageScore + '/100');