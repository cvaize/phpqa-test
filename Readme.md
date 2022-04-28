# Проект проверки качества php кода инструментом phpqa
Использует: https://github.com/EdgedesignCZ/phpqa

## Установка зависимостей
1) Установите docker;
2) Установите git;
3) Используйте команду для установки node.js пакетов.
```shell
docker run --user $(id -u):$(id -g) -it --rm -v "$PWD":/usr/src/app -w /usr/src/app node npm i
```

## Использование
### Запуск статичного скрипта
Просто меняйте репозиторий в скрипте и выполнаяйте команду:
```shell
bash run.sh
```
### Запуск скрипта с переменными
В нем вы можете в командной строке указать URL репозитория github.
```shell
export GIT_URL=https://github.com/sabitertan/webpos && bash run_with_env.sh
```

