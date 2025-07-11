import { el, svg } from 'redom';

export class PlaybackControls {
  el: HTMLElement;

  private playBtn: HTMLButtonElement;
  private pauseBtn: HTMLButtonElement;
  private prevBtn: HTMLButtonElement;
  private nextBtn: HTMLButtonElement;
  public repeatBtn: HTMLButtonElement;
  public shuffleBtn: HTMLButtonElement;

  private volumeWrapper: HTMLElement;
  private volumeInput: HTMLInputElement;

  private _durationEl: HTMLElement;
  private _currentTimeEl: HTMLElement;
  private progressBar: HTMLInputElement;

  private state: 'stopped' | 'playing' | 'paused' = 'stopped';

  onPlay: () => void = () => { };
  onPause: () => void = () => { };
  onStop: () => void = () => { };
  onNext: () => void = () => { };
  onPrev: () => void = () => { };
  onRepeat: () => void = () => { };
  onShuffle: () => void = () => { };
  onVolume: (volume: number) => void = () => { };
  onSeek: (percent: number) => void = () => { };

  constructor() {

    this.playBtn = this.makeButton('play');
    this.pauseBtn = this.makeButton('pause');
    this.prevBtn = this.makeButton('prev');
    this.nextBtn = this.makeButton('next');
    this.repeatBtn = this.makeButton('repeat');
    this.shuffleBtn = this.makeButton('shuffle');

    this.volumeInput = el('input.playback-controls__input', {
      type: 'range',
      min: 0,
      max: 1,
      step: 0.01,
      value: 1,
      'aria-label': 'Громкость',
    }) as HTMLInputElement;

    this.volumeInput.addEventListener('input', () => {
      this.onVolume(Number(this.volumeInput.value));
      this.updateRangeBackground(this.volumeInput);
    });

    this.volumeWrapper = el('.playback-controls__volume', [
      svg(
        'svg.playback-controls__icon',
        { width: 16, height: 16, 'aria-hidden': 'true' },
        svg('use', { href: '/assets/img/sprite.svg#icon-volume' })
      ),
      this.volumeInput,
    ]);

    this._currentTimeEl = el('span.playback-controls__time', '0:00');
    this._durationEl = el('span.playback-controls__time', '0:00');

    this.progressBar = el('input.playback-controls__progress-input', {
      type: 'range',
      min: 0,
      max: 100,
      step: 0.1,
      value: 0,
      'aria-label': 'Прогресс трека',
    }) as HTMLInputElement;

    this.progressBar.addEventListener('input', () => {
      this.onSeek(Number(this.progressBar.value));
      this.updateRangeBackground(this.progressBar);
    });

    const progressWrapper = el('.playback-controls__progress', [this.progressBar]);

    const controls = el('.playback-controls__wrapper', [
      this.repeatBtn,
      this.prevBtn,
      this.playBtn,
      this.pauseBtn,
      this.nextBtn,
      this.shuffleBtn,
    ]);

    const progressBarWrapper = el('.playback-controls__progress-bar', [
      this._currentTimeEl,
      progressWrapper,
      this._durationEl,
    ]);

    this.el = el('div.playback-controls', [controls, progressBarWrapper]);

    this.bindButtonHandlers();
    this.updateVisibility();

    this.updateRangeBackground(this.volumeInput);
    this.updateRangeBackground(this.progressBar);
  }

  private updateRangeBackground(input: HTMLInputElement) {
    const min = Number(input.min);
    const max = Number(input.max);
    const val = Number(input.value);
    const percent = ((val - min) / (max - min)) * 100;

    input.style.background = `linear-gradient(to right, #fc6d3e 0%, #fc6d3e ${percent}%, #E8E8E8 ${percent}%, #E8E8E8 100%)`;
  }



  private bindButtonHandlers() {
    this.playBtn.onclick = () => this.resetState('playing');
    this.pauseBtn.onclick = () => this.resetState('paused');
    this.prevBtn.onclick = () => this.onPrev();
    this.nextBtn.onclick = () => this.onNext();
    this.repeatBtn.onclick = () => this.onRepeat();
    this.shuffleBtn.onclick = () => this.onShuffle();
  }

  private updateVisibility() {
    this.playBtn.style.display = this.state === 'playing' ? 'none' : '';
    this.pauseBtn.style.display = this.state === 'playing' ? '' : 'none';
  }

  private makeButton(icon: string) {
    const baseClass =
      icon === 'play' || icon === 'pause'
        ? 'playback-controls__button-main'
        : 'playback-controls__button';

    return el(
      `button.${baseClass}.btn.btn--${icon}`,
      { 'aria-label': icon },
      this.createIcon(icon)
    ) as HTMLButtonElement;
  }

  private createIcon(name: string) {
    const size = name === 'play' ? 40 : 24;

    return svg(
      'svg.playback-controls__icon',
      { width: size, height: size, 'aria-hidden': 'true' },
      svg('use', { href: `/assets/img/sprite.svg#icon-${name}` })
    );
  }


  public setVisualState(state: 'playing' | 'paused' | 'stopped') {
    this.state = state;
    this.updateVisibility();
  }

  public resetState(state: 'playing' | 'paused' | 'stopped') {
    this.setVisualState(state);
    if (state === 'playing') this.onPlay();
    if (state === 'paused') this.onPause();
    if (state === 'stopped') this.onStop();
  }

  get playButton() {
    return this.playBtn;
  }

  get pauseButton() {
    return this.pauseBtn;
  }

  get durationEl() {
    return this._durationEl;
  }

  get currentTimeDisplay() {
    return this._currentTimeEl;
  }

  get progressInput() {
    return this.progressBar;
  }

  get volumeSlider() {
    return this.volumeInput;
  }

  get progressBarEl() {
    return this.progressBar;
  }

  get volumeEl() {
    return this.volumeWrapper;
  }
}








