import Phaser from 'phaser';

export interface SpawnMeteorConfig {
  label: string;
  duration: number;
  level: number;
}

export interface MeteorDefenseSceneCallbacks {
  onMeteorImpact?: () => void;
}

export default class MeteorDefenseScene extends Phaser.Scene {
  private meteor?: Phaser.GameObjects.Container;
  private meteorTween?: Phaser.Tweens.Tween;
  private callbacks: MeteorDefenseSceneCallbacks = {};
  private warningOverlay?: Phaser.GameObjects.Rectangle;
  private cityShield?: Phaser.GameObjects.Rectangle;
  private motherShip?: Phaser.GameObjects.Container;
  private groundY = 0;

  constructor() {
    super({ key: 'MeteorDefenseScene' });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#020617');
    this.groundY = height - 120;

    this.spawnStars();
    this.createCityscape();
    this.createMotherShip();

    this.warningOverlay = this.add
      .rectangle(width / 2, height / 2, width, height, 0xff2f2f, 0)
      .setDepth(200);

    this.game.events.emit('meteor-scene-ready', this);
  }

  setCallbacks(callbacks: MeteorDefenseSceneCallbacks) {
    this.callbacks = callbacks;
  }

  resetForNewSession() {
    this.clearMeteor();
    if (this.warningOverlay) {
      this.warningOverlay.alpha = 0;
    }
    if (this.motherShip) {
      this.motherShip.setAlpha(1);
      this.motherShip.setScale(1);
    }
  }

  spawnMeteor(config: SpawnMeteorConfig) {
    this.clearMeteor();

    const { width } = this.scale;
    const meteorContainer = this.add.container(width / 2, -140).setDepth(80);

    const glow = this.add.circle(0, 0, 90, 0xffc260, 0.3);
    const body = this.add.circle(0, 0, 72, 0xff8f1f, 1).setStrokeStyle(6, 0xffbe0b, 0.9);
    const text = this.add
      .text(0, 0, config.label, {
        fontFamily: 'Orbitron, Nunito, sans-serif',
        fontSize: 36,
        color: '#082f49',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const tail = this.add.rectangle(0, 80, 28, 130, 0xf97316, 0.35);
    meteorContainer.add([tail, glow, body, text]);
    meteorContainer.setScale(0.9 + config.level * 0.05);

    this.tweens.add({
      targets: tail,
      scaleY: 0.6,
      alpha: 0.25,
      yoyo: true,
      duration: 220,
      repeat: -1
    });

    this.meteor = meteorContainer;

    this.meteorTween = this.tweens.add({
      targets: meteorContainer,
      y: this.groundY - 60,
      duration: Math.max(2200, config.duration),
      ease: 'Linear',
      onComplete: () => {
        this.handleMeteorImpact();
      }
    });
  }

  intensifyMeteor() {
    if (!this.meteor) {
      return;
    }
    this.flashWarning();
    this.pulseShield(0xf97316);
    this.tweens.add({
      targets: this.meteor,
      scaleX: this.meteor.scaleX * 1.12,
      scaleY: this.meteor.scaleY * 1.12,
      duration: 220,
      ease: 'Sine.easeInOut',
      yoyo: true
    });
    if (this.meteorTween) {
      this.meteorTween.timeScale = Math.min(this.meteorTween.timeScale * 1.25, 3);
    }
  }

  destroyMeteorWithRocket(onComplete: () => void) {
    if (!this.meteor) {
      onComplete();
      return;
    }

    const target = this.meteor;
    if (this.meteorTween) {
      this.meteorTween.remove();
      this.meteorTween = undefined;
    }

    const rocket = this.createRocket(target.x, this.groundY + 60);

    this.tweens.add({
      targets: rocket,
      x: target.x,
      y: target.y,
      duration: 520,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.emitExplosion(target.x, target.y, 1.1);
        rocket.destroy();
        target.destroy(true);
        this.meteor = undefined;
        this.time.delayedCall(600, onComplete);
      }
    });
  }

  triggerMotherShipDestruction(onComplete: () => void) {
    if (!this.motherShip) {
      onComplete();
      return;
    }
    const ship = this.motherShip;
    const rocket = this.createRocket(this.scale.width / 2, this.groundY + 60).setDepth(120);

    this.tweens.add({
      targets: rocket,
      x: ship.x,
      y: ship.y - 10,
      duration: 640,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.emitExplosion(ship.x, ship.y, 1.4);
        this.tweens.add({
          targets: ship,
          alpha: 0,
          scale: 1.3,
          duration: 700,
          ease: 'Quad.easeIn',
          onComplete: () => {
            rocket.destroy();
            onComplete();
          }
        });
      }
    });
  }

  triggerCityDestruction(onComplete: () => void) {
    this.flashWarning();
    this.emitExplosion(this.scale.width / 2, this.groundY - 20, 1.6);
    this.cameras.main.shake(420, 0.01);
    this.time.delayedCall(900, onComplete);
  }

  private handleMeteorImpact() {
    this.emitExplosion(this.meteor?.x ?? this.scale.width / 2, this.groundY - 20, 1);
    this.pulseShield(0xf87171);
    this.clearMeteor();
    this.callbacks.onMeteorImpact?.();
  }

  private createRocket(x: number, y: number) {
    const body = this.add.rectangle(0, 0, 16, 54, 0xe2e8f0, 1).setStrokeStyle(2, 0x38bdf8);
    const nose = this.add.triangle(0, -42, -14, -18, 14, -18, 0, -52, 0x38bdf8, 1);
    const finLeft = this.add.triangle(-12, 16, -22, 30, -4, 28, -12, 8, 0x1d4ed8, 1);
    const finRight = this.add.triangle(12, 16, 22, 30, 4, 28, 12, 8, 0x1d4ed8, 1);
    const flame = this.add.triangle(0, 28, -10, 28, 10, 28, 0, 52, 0xf97316, 0.8);
    const rocket = this.add.container(x, y, [body, nose, finLeft, finRight, flame]).setDepth(100);
    this.tweens.add({
      targets: flame,
      scaleY: 0.6,
      alpha: 0.4,
      yoyo: true,
      duration: 160,
      repeat: -1
    });
    return rocket;
  }

  private emitExplosion(x: number, y: number, power: number) {
    const flash = this.add.circle(x, y, 28 * power, 0xfff3c7, 0.85).setDepth(180);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 3.2,
      duration: 520,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy()
    });

    const shards = 12;
    for (let i = 0; i < shards; i += 1) {
      const angle = (Math.PI * 2 * i) / shards;
      const spark = this.add.rectangle(x, y, 6, 2, 0xfacc15, 0.9).setRotation(angle).setDepth(170);
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * 120 * power,
        y: y + Math.sin(angle) * 120 * power,
        alpha: 0,
        scaleX: 2.2,
        duration: 520,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy()
      });
    }
  }

  private flashWarning() {
    if (!this.warningOverlay) {
      return;
    }
    this.tweens.killTweensOf(this.warningOverlay);
    this.warningOverlay.alpha = 0;
    this.tweens.add({
      targets: this.warningOverlay,
      alpha: { from: 0.45, to: 0 },
      duration: 240,
      ease: 'Quad.easeOut'
    });
  }

  private pulseShield(color: number) {
    if (!this.cityShield) {
      return;
    }
    this.cityShield.setFillStyle(color, 0.35);
    this.tweens.add({
      targets: this.cityShield,
      alpha: { from: 0.55, to: 0.25 },
      duration: 220,
      ease: 'Quad.easeOut',
      yoyo: true
    });
  }

  private clearMeteor() {
    if (this.meteorTween) {
      this.meteorTween.remove();
      this.meteorTween = undefined;
    }
    if (this.meteor) {
      this.meteor.destroy(true);
      this.meteor = undefined;
    }
  }

  private spawnStars() {
    const { width, height } = this.scale;
    for (let i = 0; i < 60; i += 1) {
      const star = this.add.circle(Math.random() * width, Math.random() * height, Math.random() * 2 + 0.5, 0xffffff, 0.6);
      star.setDepth(0);
      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 0.7 },
        duration: 2500 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000
      });
    }
  }

  private createCityscape() {
    const { width } = this.scale;
    const base = this.add.rectangle(width / 2, this.groundY + 120, width + 40, 200, 0x0f172a, 1).setOrigin(0.5, 1);
    base.setDepth(20);
    const skylineColors = [0x0f1f51, 0x1e3a8a, 0x172554];
    for (let i = 0; i < 8; i += 1) {
      const w = 60 + Math.random() * 70;
      const h = 120 + Math.random() * 140;
      const x = (width / 8) * i + w / 2 + Math.random() * 20 - width / 16;
      const building = this.add.rectangle(x, this.groundY + 60, w, h, skylineColors[i % skylineColors.length], 1);
      building.setOrigin(0.5, 1);
      building.setDepth(25);
    }
    this.cityShield = this.add.rectangle(width / 2, this.groundY - 10, width - 160, 12, 0x38bdf8, 0.3).setDepth(60);
  }

  private createMotherShip() {
    const { width } = this.scale;
    const hullGlow = this.add.ellipse(0, 0, 340, 110, 0x38bdf8, 0.25);
    const hull = this.add.ellipse(0, 0, 280, 90, 0x1f2937, 1).setStrokeStyle(6, 0x60a5fa, 0.8);
    const canopy = this.add.ellipse(0, -10, 200, 50, 0x0f172a, 0.9).setStrokeStyle(4, 0x38bdf8, 0.8);
    const lights: Phaser.GameObjects.Shape[] = [];
    for (let i = 0; i < 5; i += 1) {
      const light = this.add.ellipse(-120 + i * 60, 20, 26, 18, 0xfacc15, 0.85);
      lights.push(light);
    }
    this.motherShip = this.add.container(width / 2, 120, [hullGlow, hull, canopy, ...lights]).setDepth(90);
    this.tweens.add({
      targets: this.motherShip,
      y: '+=8',
      duration: 2200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }
}
