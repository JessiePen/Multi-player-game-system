const moment = require('moment');
const card = ['add4', 'colour-change','blue-1','blue-2','blue-3','blue-4','blue-5','blue-6','blue-7','blue-8','blue-9','blue-add2',
'blue-inverse','green-1','green-2','green-3','green-4','green-5','green-6','green-7','green-8','green-9','green-add2','green-inverse',
'yellow-1','yellow-2','yellow-3','yellow-4','yellow-5','yellow-6','yellow-7','yellow-8','yellow-9','yellow-add2','yellow-inverse',
'red-1','red-2','red-3','red-4','red-5','red-6','red-7','red-8','red-9','red-inverse','red-add2']

function formatCard(username){
    const random = Math.floor(Math.random()*46)
    const attribute = card[random]
    const id = Math.random().toFixed(5)
    

    return{
        id,
        username,
        attribute,
        time: moment().format('h:mm a')
    }
}

module.exports = formatCard;