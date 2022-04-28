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
### Работа с датасетом
#### Поместите датасет csv в файл`./dataset/60k_php_dataset_for_labelling.csv`
```csv
nameWithOwner,link,description,createdAt,pushedAt,isFork,diskUsage (kb),D. Orlov score,D. Orlov - Why did I lower the score.
iamfiscus/codeigniter-ion-auth-migration,https://github.com/iamfiscus/codeigniter-ion-auth-migration,"If you are using the ion auth authentication library, this is a default migration and data
that mimic's ion auth's sql file.",2011-07-28T14:51:30Z,2018-10-04T08:07:24Z,FALSE,136,7.5,
naitsirch/tcpdf-extension,https://github.com/naitsirch/tcpdf-extension,This repository provides a PHP library which extends the TCPDF library for example with smart tables in an OOP style.,2014-01-10T13:48:57Z,2021-08-25T16:13:56Z,FALSE,41,8,
pluginsGLPI/sccm,https://github.com/pluginsGLPI/sccm,Microsoft System Center Configuration Manager,2014-09-08T08:57:15Z,2022-03-25T10:41:02Z,FALSE,537,8,
```
#### Генерация аналитики
```shell
bash run_with_env_dataset.sh
```
Аналитика будет помещаться в директорию `dataset/analysis`.
#### Очистка файлов аналитики от ошибочных результатов
```shell
docker run --user $(id -u):$(id -g) -it --rm -v "$PWD":/usr/src/app -w /usr/src/app node node clear-dataset-analysis.js
```
#### Записать баллы из аналитики в файд csv датасет `60k_php_dataset_for_labelling_result.csv`.
```shell
docker run --user $(id -u):$(id -g) -it --rm -v "$PWD":/usr/src/app -w /usr/src/app node node write-analysis-to-dataset.js
```



### Другие команды
#### Запуск статичного скрипта
Просто меняйте репозиторий в скрипте и выполнаяйте команду:
```shell
bash run.sh
```
#### Запуск скрипта с переменными
В нем вы можете в командной строке указать URL репозитория github.
```shell
export GIT_URL=https://github.com/sabitertan/webpos && bash run_with_env.sh
```

