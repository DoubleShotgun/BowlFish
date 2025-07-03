//TODO: each fish have status likely to breed
//      Online stuff (leaderboard, visting fishes)
//      Fish Breeding
//      Fish Rarity
//      Discord game status
//      Icon

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n
}

var refresh = true

//FIXME: broken utf8 combining
var fishSprite=[
	["  ‚ ",
	 ">(<)",
	 "  ’ "],
	["\\   ",
	 " >_̅>",
	 "/   "],
	["   ,   ",
	 "><))(_̅>",
	 "   ’   "]
]

var defaultShop = 
[{
	name:"Caught Fish Value",
	cost:1,
	costInc :1,
	value:"fishValue",
	valueInc:1
},
{
	name:"Caught Fish Rate",
	cost:10,
	costInc:5,
	value:"fishRate",
	valueInc:-5000,
	valueIncMax:-500,
	valueIncMul:0.96,
},
{
	name:"Max Fish Capacity",
	cost:250,
	costMul:250,
	value:"fishMax",
	valueList:[6,9,12,15,18,20]
}]

function defaultGame(){
	return {
		points:0,
		fishes:[],
		bait:20,
		baitTimer:300,
		fishValue:1,
		fishMax:3,
		fishRate: 3.6e+6,
		lastTime: Date.now(),
		shop:defaultShop
	}
}

function checkGame(){
	var dg = defaultGame()
	for (var [k, v] of Object.entries(dg)){
		if (game[k]!==undefined) continue
		console.log(`Game value "${k}" doesnt an exist, adding it with default value`)
		game[k] = v
	}
}
function checkShop(){
	if (game.shop.length===defaultShop.length) return
	
	defaultShop.forEach(function(item,i){
		if (typeof game.shop[i]=="object") return
		console.log(`Item "${item.name}" doesnt an exist, adding it with default value`)
		game.shop[i] = item
	})
}
	
function setFishInterval(fish){
	fish.timerID = setInterval(function(){
		pointSet(game.points+fish.value)
	},fish.rate)
}

function earnOffine(){
	var dt = Date.now()-game.lastTime
	// dt = 1000*3600*8

	var t=0
	game.fishes.forEach(function(fish,i){
		if(fish.rate===0)
			var earning = Math.floor((dt/40),dt)*fish.value
		else
			var earning = Math.floor((dt/fish.rate),dt)*fish.value
		t+=earning
		pointSet(game.points+earning)
		console.log(`${fish.name}: ${formatMoney(earning)}, ${dt}`)
		setFishInterval(fish)
	})
	console.log(`Total: ${formatMoney(t)}`)

	if (game.bait>=20) return

	game.bait += Math.floor(dt/(300*1000))
	game.baitTimer -= Math.floor(dt%(300*1000)/1000)
	
	if (game.baitTimer<0) {
		game.baitTimer=game.baitTimer.mod(300)
		game.bait++
	}
	if (game.bait>=20) 
		game.bait=20
}

var game = localStorage.getItem("game")
if (game){
	game = JSON.parse(game)
	checkGame()
	checkShop()
	earnOffine()
}else{
	game = defaultGame()
}
pointSet(game.points)

var shop = game.shop

function save(){
	game.lastTime = Date.now()
	if (game.points===Infinity)
		game.points = "Infinity"
		
	localStorage.setItem("game",JSON.stringify(game))
	
	if (game.points==="Infinity")
		game.points = Infinity
}

function countNumber(number){
	return Math.floor(Math.log10(Math.abs(number))) + 1
}

function formatMoney(money){
	if (money==Infinity) return "$Infinity"
	var str = "$"
	if (money>=1000){
		suffixes = [
			"K",
			"M",
			"B",
			"T",
			"Qa",
			"Qi",
			"Sx",
			"Sp",
			"Oc",
			"No",
			"De"
		]
		var digits = countNumber(money)
		var sf = suffixes[Math.floor((digits-1)/3)-1]
		if(sf===undefined)
			str += String(money.toExponential(2))
		else
			str += (money/Math.pow(10,Math.floor((digits-1)/3)*3)).toFixed(2)+sf
	}else{
		str += money.toFixed(2)
	}
	return str
}

function fishesAtCapacity(){
	return game.fishes.length>=game.fishMax
}

function pointSet(value){
	game.points = value
	if (game.points === "Infinity"){
		game.points = Infinity
	}else if (isNaN(game.points)){
		console.log("Money is NaN, resetting to 0")
		game.points = 0
	}else if (game.points === null){
		console.log("Money is null, resetting to 0")
		game.points = 0
	}
	document.getElementById("status").innerText = formatMoney(game.points)
}

setInterval(function(){
	
	if(game.bait<20) game.baitTimer--
	else game.baitTimer=300
	if(game.baitTimer==0){
		game.baitTimer=300
		game.bait++
		
	}
	var currTab = document.body.children[1].elements["tab"].value
	if (refresh)
		document.getElementById(currTab).click()
},1000)

function normalRandom(min,max,skew=1) {
  let u = 0, v = 0;
    while(u === 0) u = Math.random()  
    while(v === 0) v = Math.random()
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
    
    num = num / 10.0 + 0.5  
    if (num > 1 || num < 0) 
      num = randn_bm(min, max, skew)  
    
    else{
      num = Math.pow(num, skew)  
      num *= max - min  
      num += min  
    }
    return num
}

function addFish(fish){
	setFishInterval(fish)
	game.fishes.push(fish)
}

function formatTime(time,point){
	time = time/1000
	var str = ""
	if (time>3600)
		str += String((time/3600).toFixed(point))+" hour"
	else if (time>60)
		str += String((time/60).toFixed(point))+" minute"
	else
		str += String(time.toFixed(point))+ " second"
	
	if (time!=1)str += "s"
	return str
}

function stringFish(fish){
	if(fish.rate.toFixed(2)==0)
		var rate = "frame"
	else
		var rate = formatTime(fish.rate,2)
	return formatMoney(fish.value)+" every "+rate
}

function randomFish(value,rate){
	if (value===undefined){
		 var r = 0	
		 var v = 0	
	}else{
		var r = (normalRandom(rate-900*1000,rate+900*1000))
		var v = Number(normalRandom(value/2,value*2).toFixed(2))
		if (r<0) r=0
	}
	
	return {
		"name":window.names[Math.floor(Math.random()*window.names.length)],
		"spriteIndex":parseInt(Math.random()*3),
		"value":v,
		"rate":r,
	}
}
function cast(){
	if (game.castFish===undefined)
		game.castFish = randomFish(game.fishValue,game.fishRate)
		
	var keepButton = document.createElement("button")
	var sellButton = document.createElement("button")
	
	var name = document.createElement("input")
	name.style = "text-align: center; width: 50%"

	canvas.innerHTML = ""
	keepButton.innerText = "Keep"
	if (fishesAtCapacity())
		keepButton.disabled = true
	keepButton.onclick = function(){
		game.bait -= 1
		if (name.value.length!=0)
			game.castFish.name = name.value
		addFish(game.castFish)
		document.getElementById("cast").click()
		refresh = true
		game.castFish = undefined
	}
	
	sellButton.innerText = "Sell"
	sellButton.onclick = function(){
		game.bait -= 1
		pointSet(game.points+game.castFish.value)
		document.getElementById("cast").click()
		refresh = true
		game.castFish = undefined
	}
	
	var c = document.createElement("center")
	name.value = game.castFish.name
	name.placeholder = game.castFish.name
	c.append(
		name,"\n\n",
		fishSprite[game.castFish.spriteIndex].join("\n")+"\n\n"+
		stringFish(game.castFish)+"\n\n",
		keepButton,sellButton
	)
	canvas.append(c)
	refresh = false
}

function reset(){
	game = defaultGame()
	save()
	location.reload()
}

var debug = document.getElementById("debug")

if (debug){

	debug.onclick = function(){
		document.getElementById("canvas").innerHTML = `
Set Points: <input type="number" id="debug-points"></input>
Set Bait: <input type="number" id="debug-bait"></input>
Unlimited Points: <input type="checkbox" id="debug-infinity"></input>
Add Fish:
<textarea rows=8 cols=24 style="resize:none" id="debug-add-fish-text"></textarea> <input type="submit"id="debug-add-fish-button" value="Add"></input>
<input type="submit" value="Clear data" onclick="reset()"></input>
`

		refresh = false
		
		
		var debugPoints = document.getElementById("debug-points")
		debugPoints.value = game.points
		debugPoints.onchange = function(){
			pointSet(Number(debugPoints.value))
		}
		var debugBait = document.getElementById("debug-bait")
		debugBait.value = game.bait
		debugBait.onchange = function(){
			game.bait = Number(debugBait.value)
		}
		
		var debugInfinity = document.getElementById("debug-infinity")
		if (game.points === Infinity)
			debugInfinity.checked = true
		debugInfinity.onclick = function(){
			if(debugInfinity.checked){
				pointSet(Infinity)
			} else {
				pointSet(Number(debugPoints.value))
			}
		}
		
		var debugAddFishText = document.getElementById("debug-add-fish-text")
		debugAddFishText.value = JSON.stringify(randomFish(),null,2)
		var debugAddFishButton = document.getElementById("debug-add-fish-button")
		debugAddFishButton.onclick = function(){
			var fish = JSON.parse(debugAddFishText.value)
			addFish(fish)
			debugAddFishButton.style.backgroundColor = "lime"
			debugAddFishButton.style.color = "white"
			debugAddFishButton.style.borderColor = "green"
		}
		debugAddFishButton.onmouseleave = function(){
			debugAddFishButton.style.color = ""
			debugAddFishButton.style.borderColor = ""
			debugAddFishButton.style.backgroundColor = ""
		}
		
	}
	
}

function renameFish(i){
	var original = document.getElementById("fish-name"+i)
	var replace = document.createElement('input')
	replace.value = original.innerText
	replace.onchange = function(){
		original.innerText = replace.value
		replace.replaceWith(original)
		game.fishes[i].name = replace.value
	}
	original.replaceWith(replace)
}

function sellFish(i){
	var fish = game.fishes[i]
	pointSet(game.points+fish.value)
	clearInterval(fish.timerID)
	game.fishes.splice(i,1)
	document.getElementById("fishes").click()
	clearInterval()
}

document.getElementById("fishes").onclick = function(){
	canvas.innerHTML = `Fishes: ${game.fishes.length}/${game.fishMax}\n<hr>`

	refresh = false

	
	game.fishes.forEach(function(fish,i){
		var padding = "   "
		if (fish.spriteIndex==2)
			padding=""
			
		canvas.innerHTML += fishSprite[fish.spriteIndex][0]+padding
			
		canvas.innerHTML += '<span id="fish-name'+i+'">'+fish.name+"</span>"
		canvas.innerHTML += "\n"
		
		canvas.innerHTML += fishSprite[fish.spriteIndex][1]+"  "+padding
		canvas.innerHTML += stringFish(fish)
		
		canvas.innerHTML += "\n"
		canvas.innerHTML += fishSprite[fish.spriteIndex][2]+"  "+padding
		canvas.innerHTML += '<button class="renameButton" onclick="renameFish('+i+')">RENAME</button>'
		canvas.innerHTML += ' <button class="sellButton" onclick="sellFish('+i+')">SELL</button>'
		canvas.innerHTML += "\n"
		canvas.innerHTML += "<hr>"
	})
	canvas.innerHTML += "\n\n"
}

function roundCost(item){
	var n = Math.floor((countNumber(item.cost)-1)/3)*3
	item.cost = Math.floor(item.cost/Math.pow(10,n-2))*Math.pow(10,n-2)
}

function buyItem(i,max=false){
	//TODO: remove "shop[i]"

	if (max===true && game.points===Infinity) true
	
	var cost = shop[i].cost
	if (shop[i].cost>game.points) return
	do{
		pointSet(game.points-cost)
		shop[i].level++
		
		if (shop[i].level%25==0){
			shop[i].costInc*=2.5
		}

		if (shop[i].valueIncMax===undefined){
			if (shop[i].level%50==0){
				shop[i].valueInc*=2
			} else if (shop[i].level%100==0){
				shop[i].valueInc*=10
			}
		}

		if (shop[i].valueInc===undefined){
			game[shop[i].value] = shop[i].valueList[shop[i].level-2]
		}else{
			if (shop[i].level%10==0){
				if(shop[i].valueIncMul!==undefined){
					if (shop[i].valueIncMax>=shop[i].valueInc)
						shop[i].valueInc *=  shop[i].valueIncMul
					else
						shop[i].valueInc =  shop[i].valueIncMax
				}
					
				game[shop[i].value] +=  shop[i].valueInc*10
			}else{
				game[shop[i].value] +=  shop[i].valueInc
			}
		}

		if(shop[i].costInc===undefined)
			shop[i].cost *= shop[i].costMul
		else
			shop[i].cost += shop[i].costInc
		cost = shop[i].cost
	}while(max && (cost<=game.points))
	roundCost(shop[i])
	
	document.getElementById("buy").click()
}

function stringItem(item){
	if(item.max)
		return "LV MAX"
	else{
		var cost = item.cost
		return `${formatMoney(cost)} LV ${item.level}`
	}
}

document.getElementById("buy").onclick = function(){
	canvas.innerHTML = ""
	refresh = false
	shop.forEach(function(item,i){
		if(item.level===undefined)item.level=1
		canvas.innerHTML += `${item.name}
  ${stringItem(item)}\n`
  
  	if (item.max===undefined)
			item.max = false
		if(item.valueList!==undefined){
			item.max = (item.level-1===item.valueList.length)
		}

		var t = ""
		if (item.max)
			t = " disabled"
		
		canvas.innerHTML += '  <button class="buyButton" onclick="buyItem('+i+')"'+t+'>BUY</button>'
		canvas.innerHTML += ' <button class="buyButton" onclick="buyItem('+i+',true)"'+t+'>BUY MAX</button>'
		canvas.innerHTML += "<hr>"
	})
}

document.getElementById("cast").onclick = function(){
	var canvas = document.getElementById("canvas")
	canvas.innerHTML = ''
	var c = document.createElement("center")
	refresh = true
	c.innerHTML = ''
	c.innerHTML += "   ,\n"
	c.innerHTML += "  /|\n"
	c.innerHTML += " / |\n"
	c.innerHTML += "/* ¿\n\n"
	c.innerHTML += `${game.bait} of 20 baits\n`
	if(game.bait<20) {
		c.innerHTML += `\nMore bait:\n`
		c.innerHTML += `${formatTime(game.baitTimer*1000,0)}\n`
	}
	var temp = ""
	if(game.bait==0) temp=" disabled"
	c.innerHTML += `\n<button onclick=cast() id="cast-cast"${temp}>Cast</button>`

	canvas.append(c)
}
document.getElementById("cast").onclick()

window.addEventListener("visibilitychange",function(event){
	save()
})
