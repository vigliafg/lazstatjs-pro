import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Wave 6 procedures (compact es edition). */
export const w6Topics: HelpTopic[] = [
  procedureTopic({
    id: "competing", title: "Riesgos competitivos", summary: "Estima la incidencia acumulada de una causa mientras las demás compiten por el mismo tiempo.",
    goal: "Medir con qué frecuencia aparece una causa concreta cuando los sujetos pueden salir por otras causas.",
    steps: ["Elige tiempo y evento con los códigos de las causas (0 = censurado).", "Introduce el código de la causa de interés.", "Selecciona las covariables y ejecuta el modelo de Fine–Gray.", "Lee la curva de incidencia acumulada y los hazard ratio de subdistribución."],
    expected: "Resumen de eventos y causas, coeficientes de Fine–Gray con sHR y curva de incidencia acumulada en el perfil medio.",
    whenToUse: ["Cuando un evento tiene varias causas mutuamente excluyentes y no independientes.", "Cuando quieres la probabilidad de una causa a lo largo del tiempo."],
    assumptions: ["Las causas son exhaustivas y excluyentes; la censura no es informativa.", "Los hazard ratio de subdistribución son constantes en el tiempo."],
    reading: ["La CIF es la probabilidad de la causa elegida antes de t con las demás causas presentes.", "Kaplan–Meier trata las causas competitivas como censura y no da la CIF."],
    pitfalls: ["Leer la CIF como 1 − supervivencia de la causa elegida.", "Elegir la causa después de ver los resultados."],
    charts: ["Curva de incidencia acumulada de la causa elegida.", "Forest plot de los hazard ratio de subdistribución."],
  }),
  procedureTopic({
    id: "recurrent", title: "Eventos recurrentes", summary: "Modela eventos repetidos por sujeto con Andersen–Gill o Wei–Lin–Weissfeld y errores robustos.",
    goal: "Estimar el efecto de las covariables sobre la tasa de eventos repetidos sin suponer independencia entre eventos del mismo sujeto.",
    steps: ["Selecciona el id del sujeto y las columnas inicio, fin y evento en formato inicio-fin.", "Elige Andersen–Gill para el proceso global o Wei–Lin–Weissfeld por número de evento.", "Añade las covariables y ejecuta.", "Lee los hazard ratio y los intervalos robustos."],
    expected: "Resumen de sujetos y episodios, hazard ratio con errores agrupados y pruebas globales.",
    whenToUse: ["Cuando un mismo sujeto puede sufrir el evento varias veces: recaídas, fallos, ingresos.", "Cuando los eventos de un sujeto están correlacionados."],
    assumptions: ["Censura no informativa e intervalos inicio-fin coherentes.", "AG supone un efecto común; WLW una baseline por número de evento."],
    reading: ["AG mantiene al sujeto en riesgo tras cada evento y usa tiempo calendario.", "WLW usa el tiempo desde el evento anterior y un estrato por número de evento."],
    pitfalls: ["Tratar cada fila como un sujeto independiente.", "Confundir tiempo calendario y tiempo entre eventos."],
    charts: ["Forest plot de los hazard ratio robustos."],
  }),
  procedureTopic({
    id: "alt", title: "Pruebas de vida acelerada", summary: "Relaciona la duración con una variable de estrés mediante un AFT de Weibull y reporta el factor de aceleración.",
    goal: "Estimar la vida en el estrés de uso a partir de pruebas a estrés más alto.",
    steps: ["Selecciona tiempo, evento y la columna de estrés.", "Elige la relación: Arrhenius (1/estrés), potencia inversa (log estrés) o exponencial (estrés).", "Introduce el estrés de uso y las covariables.", "Ejecuta y lee el factor de aceleración y los time ratio."],
    expected: "Resumen AFT de Weibull con factor de aceleración, time ratio y gráfico de barras del factor.",
    whenToUse: ["Cuando los componentes se prueban a estrés superior al de operación.", "Cuando se espera que el mecanismo de fallo no cambie con el estrés."],
    assumptions: ["La distribución de Weibull describe los tiempos y el mecanismo no cambia.", "El estrés se mide sin error y los niveles están bien separados."],
    reading: ["El factor compara la vida en el estrés de uso con la del estrés observado más bajo.", "El time ratio se refiere a una unidad de la variable transformada."],
    pitfalls: ["Extrapolar mucho más allá del rango probado sin justificación física.", "Leer el time ratio como si fuera sobre el estrés bruto."],
    charts: ["Forest plot de los time ratio.", "Gráfico de barras del factor de aceleración."],
  }),
  procedureTopic({
    id: "reliability", title: "Crecimiento de fiabilidad y RBD", summary: "Sigue una curva de crecimiento Crow–AMSAA o combina fiabilidades de componentes en un diagrama serie/paralelo.",
    goal: "Ver si un sistema reparable mejora o calcular la fiabilidad del sistema a partir de sus componentes.",
    steps: ["Elige crecimiento para fallos acumulados, o RBD para combinar fiabilidades.", "Para crecimiento selecciona tiempo y fallos acumulados y ejecuta.", "Para RBD introduce la fiabilidad de cada componente y agrupa en paralelo las del mismo estadio.", "Lee los parámetros o la fiabilidad del sistema e identifica el estadio más débil."],
    expected: "Crecimiento: β, λ, MTBF acumulado e instantáneo y gráfico observado/ajustado. RBD: fiabilidad por estadio y del sistema.",
    whenToUse: ["Cuando un sistema reparable se mejora y quieres comprobar que los fallos disminuyen.", "Cuando la fiabilidad del sistema debe derivarse de los componentes."],
    assumptions: ["Crecimiento: proceso de Poisson no homogéneo con intensidad de ley de potencia y correcciones acumuladas.", "RBD: componentes independientes y fiabilidades conocidas sin incertidumbre."],
    reading: ["β < 1 indica una tasa de fallo decreciente; β = 1 es un proceso de Poisson homogéneo.", "En serie la fiabilidad es el producto de etapas; en paralelo 1 − Π(1 − r)."],
    pitfalls: ["Leer la curva de crecimiento como predicción más allá del tiempo observado.", "Olvidar que una etapa en serie detiene el sistema."],
    charts: ["Fallos acumulados observados y ajustados (crecimiento).", "Fiabilidad por etapa (RBD)."],
  }),
];
