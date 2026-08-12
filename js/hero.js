(function(){
  var COLS=8, ROWS=4, W=1188, H=440;
  var frontHTML =
    '<div class="comp front">'+
      '<div class="eyebrow" style="margin-bottom:22px">AI workflow software &nbsp;·&nbsp; Oakville, Canada</div>'+
      '<h1 class="h1">Making our world smarter, everyday<span style="color:#F2C230">.</span></h1>'+
      '<p>We build AI-powered workflow applications that take the repetitive work off your team’s plate — so your people can focus on the work that matters.</p>'+
    '</div>';
  var backHTML =
    '<div class="comp back">'+
      '<div class="eyebrow" style="margin-bottom:22px">Meet ExpenseFlow</div>'+
      '<h1 class="h1">Smarter workflows<span style="color:#F2C230">.</span> Less busywork<span style="color:#F2C230">.</span></h1>'+
      '<p>Every trip auto-logged by GPS, every receipt captured by camera. Our AI turns the busywork into finished, CRA-compliant reports.</p>'+
    '</div>';
  var board = document.getElementById('board');
  var tw = W/COLS, th = H/ROWS;
  for(var r=0;r<ROWS;r++){
    for(var c=0;c<COLS;c++){
      var tile=document.createElement('div');
      tile.className='tile';
      tile.style.left=(c/COLS*100)+'%';
      tile.style.top=(r/ROWS*100)+'%';
      tile.style.width=(100/COLS)+'%';
      tile.style.height=(100/ROWS)+'%';
      var nx=(-c*tw)+'px', ny=(-r*th)+'px', delay=((c+r)*45)+'ms';
      tile.innerHTML=
        '<div class="flipper" style="transition-delay:'+delay+'">'+
          '<div class="face front">'+frontHTML.replace('class="comp front"','class="comp front" style="left:'+nx+';top:'+ny+'"')+'</div>'+
          '<div class="face back">'+backHTML.replace('class="comp back"','class="comp back" style="left:'+nx+';top:'+ny+'"')+'</div>'+
        '</div>';
      board.appendChild(tile);
    }
  }
  var face=0, timer;
  function render(){
    board.classList.toggle('flipped', face===1);
    document.querySelectorAll('.dot').forEach(function(d){ d.classList.toggle('on', +d.dataset.face===face); });
  }
  function start(){ clearInterval(timer); timer=setInterval(function(){ face=face?0:1; render(); }, 5600); }
  document.querySelectorAll('.dot').forEach(function(d){
    d.addEventListener('click', function(){ face=+d.dataset.face; render(); start(); });
  });
  render(); start();
})();
