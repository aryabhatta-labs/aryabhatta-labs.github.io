document.querySelectorAll('form[data-inline-success]').forEach(function(form){
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var note = document.getElementById(form.id + 'Note');
    if (note) {
      note.className = 'ok';
      note.textContent = form.getAttribute('data-success-text');
    }
  });
});
