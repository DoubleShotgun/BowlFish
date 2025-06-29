//TODO: each fish have status to make points or likely to breed
//      Feed fish
//      Online stuff (leaderboard, visting fishes)
//      Earn offine

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n
}

function defaultGame(){
	return {
		points:0,
		fishes:[],
		bait:20,
		baitTimer:300,
		fishValue:0.5,
		fishRate: 1.8e+6,
		lastTime: Date.now(),
		shop:[
			{
				name:"Caught Fish Value",
				cost:1,
				value:"fishValue",
				valueInc:0.5,
				costInc :1
			},
			{
				name:"Caught Fish Rate",
				cost:10,
				value:"fishRate",
				valueInc:-5000,
				costInc :5
			}
		]
	}
}
	
function setFishInterval(fish){
	fish.timerID = setInterval(function(){
		pointSet(game.points+fish.value)
	},fish.rate)
}

function save(){
	game.lastTime = Date.now()
	localStorage.setItem("game",JSON.stringify(game))
}

function pointSet(value){
	game.points = value
	if (isNaN(game.points)){
		console.log("Money is NaN, resetting to 0")
		game.points = 0
	}
	if (game.points === null){
		console.log("Money is null, resetting to 0")
		game.points = 0
	}
	document.getElementById("status").innerText = "$"+game.points.toFixed(2)
}

function earnOffine(){
	var dt = Date.now()-game.lastTime
		
	game.fishes.forEach(function(fish,i){
		var earning = Math.floor((dt/fish.rate),dt)*fish.value
		pointSet(game.points+earning)
		console.log(`${fish.name}: $${earning}, ${dt}`)
		setFishInterval(fish)
	})

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
	earnOffine()
}else{
	game = defaultGame()
}
pointSet(game.points)

var shop = game.shop

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



var refresh = true

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

function stringFish(fish){
	return "$"+fish.value.toFixed(2)+" every "+(fish.rate/1000).toFixed(2)+" seconds"
}

function randomFish(value,rate){
	var r = (normalRandom(rate/1.05,rate*1.05))
	if (r<1) r=0.1
	
	return {
		"name":window.names[Math.floor(Math.random()*window.names.length)],
		"spriteIndex":parseInt(Math.random()*3),
		"value":Number(normalRandom(value/2,value*2).toFixed(2)),
		"rate":r,
	}
}
var currFish = null
function cast(){
	//FIXME: reloading reset this
	if (currFish===null)
		currFish = randomFish(game.fishValue,game.fishRate)
		
	var keepButton = document.createElement("button")
	var sellButton = document.createElement("button")
	
	var name = document.createElement("input")
	name.style = "text-align: center; width: 100px"

	canvas.innerHTML = ""
	keepButton.innerText = "Keep"
	keepButton.onclick = function(){
		game.bait -= 1
		if (name.value.length!=0)
			currFish.name = name.value
		addFish(currFish)
		document.getElementById("cast").click()
		refresh = true
		currFish = null
	}
	
	sellButton.innerText = "Sell"
	sellButton.onclick = function(){
		game.bait -= 1
		pointSet(game.points+currFish.value)
		document.getElementById("cast").click()
		refresh = true
		currFish = null
	}
	
	var c = document.createElement("center")
	name.value = currFish.name
	name.placeholder = currFish.name
	c.append(
		name,"\n\n",
		fishSprite[currFish.spriteIndex].join("\n")+"\n\n"+
		stringFish(currFish)+"\n\n",
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
		debugAddFishText.value = JSON.stringify(randomFish(1,1000),null,2)
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
	canvas.innerHTML = ""

	refresh = false
	
	game.fishes.forEach(function(fish,i){
		canvas.innerHTML += fishSprite[fish.spriteIndex][0]
			
		canvas.innerHTML += '<span id="fish-name'+i+'">'+fish.name+"</span>"
		canvas.innerHTML += "\n"
		
		canvas.innerHTML += fishSprite[fish.spriteIndex][1]+"  "
		canvas.innerHTML += stringFish(fish)
		
		canvas.innerHTML += "\n"
		canvas.innerHTML += fishSprite[fish.spriteIndex][2]+"  "
		canvas.innerHTML += '<button class="renameButton" onclick="renameFish('+i+')">RENAME</button>'
		canvas.innerHTML += ' <button class="sellButton" onclick="sellFish('+i+')">SELL</button>'
		canvas.innerHTML += "\n"
		canvas.innerHTML += "<hr>"
	})
	canvas.innerHTML += "\n\n"
}

function roundCost(item){
	var n = Math.floor(item.level/50)
	if (n>4)
		item.cost = Math.round(item.cost*Math.pow(10,4-n))/Math.pow(10,4-n)
	else 
		item.cost = Number(item.cost.toFixed((4-n)+1))
}

function buyItem(i,time){
	var cost = shop[i].cost
	if (cost*time>game.points*time) return
	for (var _=0;_<time;_++){
		pointSet(game.points-cost)
		shop[i].cost += shop[i].costInc
		shop[i].level++
		if (shop[i].level%10==0)
			game[shop[i].value] +=  shop[i].valueInc*10
		else
			game[shop[i].value] +=  shop[i].valueInc
			
		if (shop[i].level%50==0)
			shop[i].costInc*=10
		
		roundCost(shop[i])
	}
	document.getElementById("buy").click()
}

function stringItem(item){
	return `$${item.cost} LV ${item.level}`
}

document.getElementById("buy").onclick = function(){
	canvas.innerHTML = ""
	refresh = false
	shop.forEach(function(item,i){
		if(item.level===undefined)item.level=1
		canvas.innerHTML += `${item.name}
  ${stringItem(item)}\n`
		canvas.innerHTML += '  <button class="buyx1Button" onclick="buyItem('+i+',1)">BUY</button>'
		canvas.innerHTML += ' <button class="buyx10Button" onclick="buyItem('+i+',10)">BUY 10</button>'
		canvas.innerHTML += "<hr>"
	})
}

document.getElementById("cast").onclick = function(){
	var canvas = document.getElementById("canvas")
	canvas.innerHTML = ''
	var c = document.createElement("center")
	refresh = true
	c.innerHTML = ''
	c.innerHTML += "  /`.  \n"
	c.innerHTML += " /   ' \n"
	c.innerHTML += "/*    '\n\n"
	c.innerHTML += `${game.bait} of 20 baits\n`
	if(game.bait<20) {
		c.innerHTML += `\nMore bait:\n`
		c.innerHTML += `${game.baitTimer} seconds\n`
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
