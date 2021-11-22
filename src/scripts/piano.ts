import * as Tone from 'tone'

import PianoKeys from '@jesperdj/pianokeys';

import User from './user'

const piano = document.getElementById("piano");

const notes = ["C","Db","D","Eb","E","F","Gb","G","Ab", "A","Bb","B"]

const keyboard = new PianoKeys.Keyboard(piano, {
    lowest: `C${ User.get('octave', 'number') }`,
    highest: `B${ User.get('octave', 'number') }`
});

class PianoPlayer {
    piano: {};
    notesDown: [];
    constructor(pno) {
        this.piano = pno
        this.notesDown = []
        this.handlePlay = this.play.bind(this)
        this.handleListen = this.listen.bind(this)
        
        this.piano.addEventListener('click', this.handlePlay)
        this.piano.addEventListener('click', this.handleListen)
        document.addEventListener('question:start', this.clear.bind(this))

        keyboard._keys.forEach( (key, i) => {
            let noteIndex = i - (User.get('octave', 'number') * 12)
            key.setAttribute('data-note', notes[noteIndex])
        })
    }
    play(e) {
        let key = e.target.getAttribute('data-note')
        const synth = new Tone.Synth().toDestination();

        //play the note for the duration of an 8th note
        let note = this.formatNote(key)
    
        synth.triggerAttackRelease(note, "8n");        
    }
    listen(e){
        let key = e.target.getAttribute('data-note')
        let notes = User.selected_notes || []
        let note = this.formatNote(key)

        if(notes.indexOf(note) > -1) {
            this.piano.removeEventListener('click', this.handlePlay)
            keyboard.fillKey(note)
            this.notesDown.push(note)
            this.piano.addEventListener('click', this.handlePlay)
        } else if (notes.length > 0){
            keyboard.fillKey(note, 'red')
            this.notesDown.push(note)
        } else {
            keyboard.fillKey(note, 'yellow')
            setTimeout( function(){
                keyboard.clearKey(note)
            }, 300)
        }
        document.dispatchEvent(new CustomEvent('answer', { detail: note }))
    }
    clear(){
        this.notesDown.forEach( note => {
            keyboard.clearKey(note)
        })
    }
    formatNote(note){
        return `${ note }${ User.get('octave','number') }`
    }
}

new PianoPlayer(piano)