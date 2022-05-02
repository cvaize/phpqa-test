# Проект проверки качества php кода инструментом phpqa
Использует: https://github.com/EdgedesignCZ/phpqa

Внимание! В IDE открывайте директорию src, и все скрипты распологайте в ней. 
Данные распологайте в директории dataset.
Это необходимо чтобы IDE не тормозила.

## Установка зависимостей
1) Установите docker;
2) Установите git;
3) Используйте команду для установки node.js пакетов.
```shell
docker run --user $(id -u):$(id -g) -it --rm -v "$PWD":/usr/src/app -w /usr/src/app node npm i
```

## Использование
### Работа с датасетом
#### Поместите датасет csv в файл`./dataset/60k_php_dataset_metrics.csv`
```csv
nameWithOwner,link,createdAt,pushedAt,isFork,diskUsage (kb),D. Orlov score,D. Orlov - Why did I lower the score.,Maintainability,Accessibility for new developers,Simplicity of algorithms,Volume,Reducing bug's probability,Average Total
iamfiscus/codeigniter-ion-auth-migration,https://github.com/iamfiscus/codeigniter-ion-auth-migration,2011-07-28T14:51:30Z,2018-10-04T08:07:24Z,FALSE,136,7.5,,17.170000000000002,0,14.289999999999999,9.3800000000000008,0,8.1699999999999999
naitsirch/tcpdf-extension,https://github.com/naitsirch/tcpdf-extension,2014-01-10T13:48:57Z,2021-08-25T16:13:56Z,FALSE,41,8,,40.479999999999997,13.199999999999999,0,0,0,10.74
pluginsGLPI/sccm,https://github.com/pluginsGLPI/sccm,2014-09-08T08:57:15Z,2022-03-25T10:41:02Z,FALSE,537,8,,36.630000000000003,12.85,0,0,0,9.9000000000000004
abellion/xenus,https://github.com/abellion/xenus,2016-10-18T16:20:47Z,2021-03-02T14:59:19Z,FALSE,171,10,,87.349999999999994,57.299999999999997,64,98.590000000000003,91.799999999999997,79.810000000000002
rafu1987/t3bootstrap-project,https://github.com/rafu1987/t3bootstrap-project,2012-11-29T14:37:05Z,2013-09-27T16:14:34Z,FALSE,34670,1.5,,61.229999999999997,0,0,0,0,12.25
ZAP-Quebec/AuthPuppy,https://github.com/ZAP-Quebec/AuthPuppy,2013-01-18T01:23:14Z,2013-01-18T01:29:56Z,FALSE,4756,7,,97.290000000000006,49.759999999999998,50.289999999999999,100,93.439999999999998,78.159999999999997
marcelog/Ci-Php-Phing-Example,https://github.com/marcelog/Ci-Php-Phing-Example,2012-04-20T18:13:10Z,2012-04-21T14:13:38Z,FALSE,141,9,,86.599999999999994,50,100,100,100,87.319999999999993
```

## Генерация аналитики через nodejs

В этом пункте установите nodejs, желательно 18 версию (чисто чтобы обрабатывало быстрее)
```shell
node src/phpqa-test/app.js run-parallel -f "./dataset/60k_php_dataset_metrics.csv" -fc "./src/phpqa-test/.phpqa.yml" -t phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc
```

```shell
node src/phpqa-test/count-dataset-analysis.js -f "./dataset/60k_php_dataset_metrics.csv"
```

```shell
node src/phpqa-test/clear-dataset-analysis.js -f "./dataset/60k_php_dataset_metrics.csv"
```

```shell
node src/phpqa-test/write-analysis-to-dataset.js -f "./dataset/60k_php_dataset_metrics.csv"
```

```shell
node src/phpqa-test/app.js chunking -f "./dataset/60k_php_dataset_metrics.csv" -g chunk -ch 4
```

Запуск с помощью nohup
```shell
nohup node src/phpqa-test/run-parallel.js -f "./dataset/60k_php_dataset_metrics.csv" -t phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc > run_parallel.out 2>&1 &
```