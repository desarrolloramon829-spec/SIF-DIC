import { body } from 'express-validator';

export const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida'),
];

export const registerValidation = [
  body('nombre').notEmpty().trim().withMessage('Nombre requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .isIn(['admin', 'operador', 'consulta'])
    .withMessage('Rol inválido'),
];

export const hechoValidation = [
  body('caratula')
    .isIn(['rescate', 'fallecimiento_ahogamiento', 'hallazgo_cuerpo_nn'])
    .withMessage(
      'Carátula debe ser: rescate, fallecimiento_ahogamiento o hallazgo_cuerpo_nn'
    ),
  body('unidad_regional')
    .isIn(['URN', 'URS', 'URE', 'URO'])
    .withMessage('Unidad regional debe ser: URN, URS, URE o URO'),
  body('jurisdiccion').notEmpty().trim().withMessage('Jurisdicción requerida'),
  body('lugar_del_hecho')
    .notEmpty()
    .trim()
    .withMessage('Lugar del hecho requerido'),
  body('fecha_del_hecho')
    .isISO8601()
    .withMessage('Fecha del hecho inválida (formato: YYYY-MM-DD)'),
  body('fecha_del_habido')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Fecha del habido inválida (formato: YYYY-MM-DD)'),
  body('victima').notEmpty().trim().withMessage('Víctima requerida'),
  body('sexo')
    .isIn(['masculino', 'femenino'])
    .withMessage('Sexo debe ser: masculino o femenino'),
  body('edad')
    .isInt({ min: 0, max: 150 })
    .withMessage('Edad debe ser un número entre 0 y 150'),
  body('punto_ingreso')
    .isObject()
    .withMessage('Punto de ingreso requerido (objeto con lat y lng)'),
  body('punto_ingreso.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud de ingreso inválida'),
  body('punto_ingreso.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud de ingreso inválida'),
  body('punto_hallazgo')
    .isObject()
    .withMessage('Punto de hallazgo requerido (objeto con lat y lng)'),
  body('punto_hallazgo.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud de hallazgo inválida'),
  body('punto_hallazgo.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud de hallazgo inválida'),
];
