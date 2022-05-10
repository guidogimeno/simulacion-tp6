class Simulador {
  constructor(cantidadEmpleados, tf) {
    this.cantidadEmpleados = cantidadEmpleados;
    this.tf = tf;
    this.tpll = 0;
    this.t = 0;
    this.tc = new Array(cantidadEmpleados).fill(0);
    this.sto = new Array(cantidadEmpleados).fill(0);
    this.arr = 0;
    this.ste = 0;
    this.stp = 0;
    this.nt = 0;
    this.pps = 0;
    this.pte = 0;
    this.parr = 0;
    this.pto = new Array(cantidadEmpleados).fill(0);
  }

  simular() {
    console.log("Iniciando simulacion");
    console.time("Tiempo de simulación");

    while (this.t <= this.tf) {
      this.t = this.tpll;
      const ia = this.intervaloDeAtencion();
      this.tpll = this.t + ia;
      const r = this.random();
      if (r < 0.1) {
        this.peluqueriaConManicura();
      } else if (r < 0.4) {
        this.manicura();
      } else {
        this.peluqueria();
      }
    }

    console.log("Simulacion terminada");
    console.timeEnd("Tiempo de simulación");

    console.log("Resultados:");

    console.log("N:", this.cantidadEmpleados);

    console.log("NT:", this.nt);

    console.log("T:", this.t);

    this.pps = this.stp / this.nt;
    console.log("PPS:", this.pps);

    this.pte = this.ste / this.nt;
    console.log("PTE:", this.pte);

    this.parr = this.arr / (this.nt + this.arr);
    console.log("PARR:", this.parr * 100, "%");

    for (let i = 0; i < this.cantidadEmpleados; i++) {
      this.pto[i] = (this.sto[i] * 100) / this.t;
      console.log(`PTO(${i}): ${this.pto[i]} %`);
    }
  }

  intervaloDeAtencion() {
    return (Math.log(-Math.random() + 1) * -2500) / 60;
  }

  random() {
    return Math.random();
  }

  peluqueriaConManicura() {
    const i = this.menorTiempoComprometido();
    const j = this.segundoMenorTiempoComprometido();
    const tam = this.tiempoDeAtencionManicura();
    const tap = this.tiempoDeAtencionPeluqueria();

    if (this.t >= this.tc[j]) {
      this.sto[i] += this.t - this.tc[i];
      this.tc[i] = this.t + tam;
      this.sto[j] += this.t - this.tc[j];
      this.tc[j] = this.t + tap;
    } else {
      const tiempoDeEspera = this.tc[j] - this.t;
      if (this.estaArrepentido(tiempoDeEspera)) return;

      this.ste += this.tc[j] - this.t;
      if (this.t >= this.tc[i]) {
        this.sto[i] += this.tc[j] - this.tc[i];
      } else {
        this.tc[i] = this.tc[i] + tam;
        this.tc[j] = this.tc[j] + tap;
      }
    }

    if (this.tc[i] <= this.tc[j]) {
      this.stp += this.tc[j] - this.t;
    } else {
      this.stp += this.tc[i] - this.t;
    }

    this.nt += 1;
  }

  manicura() {
    const tam = this.tiempoDeAtencionManicura();
    this.darServicio(tam);
  }

  peluqueria() {
    const tap = this.tiempoDeAtencionPeluqueria();
    this.darServicio(tap);
  }

  darServicio(tiempoDeAtencion) {
    const i = this.menorTiempoComprometido();
    if (this.t >= this.tc[i]) {
      this.sto[i] += this.t - this.tc[i];
      this.tc[i] = this.t + tiempoDeAtencion;
    } else {
      const tiempoDeEspera = this.tc[i] - this.t;
      if (this.estaArrepentido(tiempoDeEspera)) return;

      this.ste += this.tc[i] - this.t;
      this.tc[i] += tiempoDeAtencion;
    }

    this.stp += this.tc[i] - this.t;
    this.nt += 1;
  }

  menorTiempoComprometido() {
    let min = 0;
    for (let i = 0; i < this.tc.length; i++) {
      if (this.tc[i] <= this.tc[min]) {
        min = i;
      }
    }
    return min;
  }

  segundoMenorTiempoComprometido() {
    const min1 = this.menorTiempoComprometido();
    let min2 = 0;
    for (let i = 0; i < this.tc.length; i++) {
      if (i !== min1 && this.tc[i] <= this.tc[min2]) {
        min2 = i;
      }
    }
    return min2;
  }

  tiempoDeAtencionPeluqueria() {
    const r = this.random();
    const aux = this.erfinv(2 * r - 1);
    return (2070.8333 + 733.4062 * Math.pow(2, 0.5) * aux) / 60;
  }

  tiempoDeAtencionManicura() {
    const r = this.random();
    const aux = this.erfinv(2 * r - 1);
    return (5432.1429 + 802.5803 * Math.pow(2, 0.5) * aux) / 60;
  }

  estaArrepentido(tiempoDeEspera) {
    if (tiempoDeEspera >= 120) {
      this.arr += 1;
      return true;
    } else if (tiempoDeEspera <= 30) {
      return false;
    } else if (tiempoDeEspera > 60) {
      const r = this.random();
      if (r < 0.75) {
        this.arr += 1;
        return true;
      } else {
        return false;
      }
    } else {
      const r = this.random();
      if (r < 0.3) {
        this.arr += 1;
        return true;
      } else {
        return false;
      }
    }
  }

  erfinv(x) {
    // maximum relative error = .00013
    const a = 0.147;
    if (0 === x) {
      return 0;
    }
    const b = 2 / (Math.PI * a) + Math.log(1 - x ** 2) / 2;
    const sqrt1 = Math.sqrt(b ** 2 - Math.log(1 - x ** 2) / a);
    const sqrt2 = Math.sqrt(sqrt1 - b);
    return sqrt2 * Math.sign(x);
  }
}

const argsArr = process.argv.slice(2);
const args = argsArr.reduce(
  (acc, el) => ({ ...acc, [el.split("=")[0]]: el.split("=")[1] }),
  {}
);

const tfToSecond = 333333333.333333;

const simulador = new Simulador(
  args.n ? parseInt(args.n) : 3,
  args.tf ? parseInt(args.tf) * tfToSecond : 60 * tfToSecond
);
simulador.simular();
