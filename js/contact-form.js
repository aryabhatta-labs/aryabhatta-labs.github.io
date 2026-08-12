document.querySelectorAll('form[data-inline-success]').forEach(function(form){
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var note = document.getElementById(form.id + 'Note');
    fetch(form.action, {
      method: form.method || 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function(response){
      if (response.ok) {
        if (note) {
          note.className = 'ok';
          note.textContent = form.getAttribute('data-success-text');
        }
        form.reset();
      } else if (note) {
        note.className = 'note';
        note.textContent = "Something went wrong — please try again or email us directly.";
      }
    }).catch(function(){
      if (note) {
        note.className = 'note';
        note.textContent = "Something went wrong — please try again or email us directly.";
      }
    });
  });
});
