var skills = {}
minimize_state = 'maximized';
lock_state     = 'unlocked';

function valid_slider(value) {
    for (var i = 1; i <= 5; ++i)
        if (value == i) return value;

    return 1; // default value
}

window.addEventListener('load', function() {
    var summary = document.getElementById('summary');
    var rect    = summary.getBoundingClientRect();

    var hide = rect.top    >= 0                  &&
               rect.left   >= 0                  &&
               rect.bottom <= window.innerHeight &&
               rect.right  <= window.innerWidth;

    var observer = new IntersectionObserver(function() {
        if (hide) {
          document.getElementById('minimize').style.opacity = '0';
          document.getElementById('lock').style.opacity     = '0';
          hide = false;
        }
        else {
          document.getElementById('minimize').style.opacity = '1';
          document.getElementById('lock').style.opacity     = '1';
          hide = true;
        }
    }, { threshold: 1.0 });
    observer.observe(summary);
});

window.addEventListener('load', function() {
     document.getElementById('summary').onmouseenter = (e) => e.target.style.bottom = '-5px';
     document.getElementById('summary').onmouseleave = (e) => e.target.style.bottom = '-125px';

     // minimize state machine
     document.getElementById('minimize').addEventListener('click', function(e) {
        if (minimize_state === 'maximized') { // not hidden
            document.getElementById('summary').style.position = 'relative';
            e.target.classList.remove('fa-window-minimize');
            e.target.classList.add('fa-plus');
            e.target.style.top = '3%';
            document.getElementById('summary').onmouseenter = (e) => {};
            document.getElementById('summary').onmouseleave = (e) => {};
            minimize_state = 'minimized';
        }
        else { // hidden
            document.getElementById('summary').style.position = 'sticky';
            e.target.classList.remove('fa-plus');
            e.target.classList.add('fa-window-minimize');
            e.target.style.top = '2%';
            if (lock_state === 'unlocked') {
                document.getElementById('summary').onmouseenter = (e) => e.target.style.bottom = '-5px';
                document.getElementById('summary').onmouseleave = (e) => e.target.style.bottom = '-125px';
            }
            minimize_state = 'maximized';
        }
    });

    // lock state machine
    document.getElementById('lock').addEventListener('click', function(e) {
        if (lock_state === 'unlocked') { // lock
            document.getElementById('summary').style.bottom = '-5px';
            e.target.classList.remove('fa-lock-open');
            e.target.classList.add('fa-lock');
            lock_state = 'locked';
            document.getElementById('summary').onmouseenter = (e) => {};
            document.getElementById('summary').onmouseleave = (e) => {};
        }
        else { // unlock
            if (minimize_state === 'maximized')
                document.getElementById('summary').style.bottom = '-125px';
            e.target.classList.remove('fa-lock');
            e.target.classList.add('fa-lock-open');
            if (minimize_state === 'maximized') {
                document.getElementById('summary').onmouseenter = (e) => e.target.style.bottom = '-5px';
                document.getElementById('summary').onmouseleave = (e) => e.target.style.bottom = '-125px';
            }
            lock_state = 'unlocked';
        }
    });

    var value1 = valid_slider(localStorage.getItem('slider1'));
    var value2 = valid_slider(localStorage.getItem('slider2'));
    var value3 = valid_slider(localStorage.getItem('slider3'));
    var value4 = valid_slider(localStorage.getItem('slider4'));
    var value5 = valid_slider(localStorage.getItem('slider5'));

    skills = {
        sliders: {
            'slider1': [value1, value_to_proficiency(value1)],
            'slider2': [value2, value_to_proficiency(value2)],
            'slider3': [value3, value_to_proficiency(value3)],
            'slider4': [value4, value_to_proficiency(value4)],
        }
    }

    Object.defineProperty(skills, 'total', {
        get() {
            total = 0;
            for (var key in this.sliders)
                total += parseInt(this.sliders[key][0]);
            return total;
        }
    });

    Array.from(document.getElementsByClassName('slider')).forEach((elem, i) => {
        elem.value = skills.sliders['slider' + (i + 1)][0];
        slider(elem.value, i + 1);
    });
});

// positions start at 1
function slider(value, position) {
  var sliderId      = 'slider'      + position;
  var valueId       = 'value'       + position;
  var proficiencyId = 'proficiency' + position;

  // VALUE; i.e., 1-5
  skills.sliders[sliderId][0] = value;   // store into the JS global
  localStorage.setItem(sliderId, value); // persists between sessions
  w3.displayObject(valueId, {[valueId]: value_to_years(value)});

  // PROFICIENCY; e.g., Novice
  skills.sliders[sliderId][1] = value_to_proficiency(value);
  w3.displayObject(proficiencyId, {[proficiencyId]: skills.sliders[sliderId][1]});

  // ROLE; e.g., Entry-level
  w3.displayObject('role', {'role': values_to_role(skills.total)});
}

// 1 --   0-3 years
// 2 --   4-7 years
// 3 --  8-11 years
// 4 -- 12-15 years
// 5 --   >15 years
function value_to_years(value) {
    var years = '0–3';

    switch (value) {
    case '5': years =   '>15'; break;
    case '4': years = '12–15'; break;
    case '3': years =  '8-11'; break;
    case '2': years =   '4-7'; break;
    case '1':
    default: break;
    }

    return years;
}

//   0-3 years -- [0, 1, 2, 3]
//   4-7 years -- [4, 5, 6, 7]
//  8-11 years -- [8, 9, 10, 11]
// 12-15 years -- [12, 13, 14, 15]
//   >15 years -- [15...]
function value_to_proficiency(value) {
  var proficiency = 'Novice';

  switch (value) {
  case '5': proficiency = 'Master';       break;
  case '4': proficiency = 'Expert';       break;
  case '3': proficiency = 'Advanced';     break;
  case '2': proficiency = 'Intermediate'; break;
  case '1':
  default: break;
  }

  return proficiency;
}

function values_to_role(total) {
  // max possible is 20
  var role = 'Entry-level';
  
  if      (total >= 16) role = 'Senior-level';
  else if (total >= 10) role = 'Junior-level';
  
  return role;
}
