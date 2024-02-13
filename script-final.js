/**функция генерации работы**/
const generateJob = (id) =>
    function () {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() < 0.8 ? resolve() : reject();
            }, Math.random() * 3000);
        });
    };


/**функция создания массива пустых отчетов по количеству роботов**/
const makeReportList = (robotsCount) => {
    const reportList = [];
    for (let i = 0; i < robotsCount; i++) {
        reportList.push({
            successCount: 0,
            failedCount: 0,
            tasks: [],
            timeSpent: 0,
            isBusy: false,
        })
    }
    return reportList;
}


/**функция выполнения задачи роботом**/
const executeTask = async (robot, task) => {
    //робот теперь занят
    robot.isBusy = true;
    //таска в массив
    robot.tasks.push(task.id);
    //запуск таймера
    let startTime = Date.now();
    //ждем завершения асинх таски. Проделываем манипуляции
    await task.job()
        .then(() => robot.successCount++)
        .catch(() => robot.failedCount++)
        .finally(() => {
            robot.isBusy = false;
            robot.timeSpent += Date.now() - startTime;
        })
    //доклад о завершении таски
    console.log(`${task.id} Executed!`)
}


/**получения отчетов по роботам**/
function getReport(list, index) {
    const report = list[index];
    return {
        successCount: report.successCount,
        failedCount: report.failedCount,
        tasks: report.tasks,
        timeSpent: report.timeSpent,
    }
}


/** число роботов **/
const robotsCount = 3;


/** coздали массив отчетов роботов по их числу **/
const robotsList = makeReportList(robotsCount);


/** пустой массив(очередь) тасок **/
const tasksQueue = [];


/** функция добавления задачи **/
const addTask = (task) => {
    tasksQueue.push(task);
}


/** добавим тасок в массив(очередь) тасок **/
addTask({
    id: "Высокоприоритетная задача",
    priority: 10,
    job: generateJob("id0"),
})
addTask({
    id: "Задача напоследок",
    priority: 2,
    job: generateJob("id1"),
})
addTask({
    id: "МЕГАважная задача",
    priority: 12,
    job: generateJob("id2"),
})
addTask({
    id: "Задача со средним приоритетом",
    priority: 5,
    job: generateJob("id3"),
})
addTask({
    id: "Низкоприоритетная задача",
    priority: 3,
    job: generateJob("id4"),
})
addTask({
    id: "Задача, которую можно и не делать :)",
    priority: 1,
    job: generateJob("id5"),
})


/** функция сортировки задач по приоритету **/
const sortTasks = (tasksQueue) => {
    tasksQueue.sort((a, b) => {
        return a.priority - b.priority;
    });
}


/**
 * функция выдачи таски роботу
 * проверяем роботов на занятость, если есть свободные - тащим задачу из очереди.
 * передаем на выполнение
**/
const giveTask = () => {
    for (let i = 0; i < robotsList.length; i++) {
        if (!robotsList[i].isBusy) {
            let currentTask = tasksQueue.pop();
            if (!currentTask) return;
            console.log(`${currentTask.id} --- определена --- выдана роботу №${i}`)
            executeTask(robotsList[i], currentTask);
            break;
        }
    }
}


/**
 * функция окончания работы
 * все роботы свободны, задач в списке не осталось
**/
const finishWork = () => {
    let allDone = true;
    for (let robot of robotsList) {
        if (robot.isBusy) {
            allDone = false;
            break;
        }
    }
    return allDone && tasksQueue.length === 0;
}


/** основная функция **/
const runAgency = async () => {
    await sortTasks(tasksQueue);
    console.log('Очередь задач:');
    console.log(tasksQueue);
    while (!finishWork()) {
        giveTask();
        //задержка между итерациями через сет таймаут,
        //НО через промисы + await, из-за асинхронности таймера
        await new Promise(res => setTimeout(res, 10));
    }
    robotsList.forEach((v, i) => {
        console.log(getReport(robotsList, i))
    })
    return null
}

console.log("Роботы:");
console.log(robotsList);

/** запуск **/
runAgency();