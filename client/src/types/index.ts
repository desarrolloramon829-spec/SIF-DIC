export interface Coordenada {
  lat: number;
  lng: number;
}

export type CaratulaTipo = 'rescate' | 'fallecimiento_ahogamiento' | 'hallazgo_cuerpo_nn';
export type UnidadRegional = 'URN' | 'URS' | 'URE' | 'URO';
export type Sexo = 'masculino' | 'femenino';
export type Rol = 'admin' | 'operador' | 'consulta';

export interface HechoFluvial {
  id: number;
  caratula: CaratulaTipo;
  unidad_regional: UnidadRegional;
  jurisdiccion: string;
  lugar_del_hecho: string;
  fecha_del_hecho: string;
  fecha_del_habido: string | null;
  victima: string;
  sexo: Sexo;
  edad: number;
  punto_ingreso: Coordenada;
  punto_hallazgo: Coordenada;
  usuario_carga_id: number | null;
  usuario_carga_nombre: string | null;
  created_at: string;
  updated_at: string;
}

export interface HechoFormData {
  caratula: CaratulaTipo;
  unidad_regional: UnidadRegional;
  jurisdiccion: string;
  lugar_del_hecho: string;
  fecha_del_hecho: string;
  fecha_del_habido: string;
  victima: string;
  sexo: Sexo;
  edad: number;
  punto_ingreso: Coordenada | null;
  punto_hallazgo: Coordenada | null;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo?: boolean;
  created_at?: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface Stats {
  total: number;
  por_caratula: { caratula: string; cantidad: string }[];
  por_unidad_regional: { unidad_regional: string; cantidad: string }[];
  por_mes: { mes: string; cantidad: string }[];
  por_sexo: { sexo: string; cantidad: string }[];
}

export interface FiltrosHechos {
  caratula?: CaratulaTipo | '';
  unidad_regional?: UnidadRegional | '';
  jurisdiccion?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Labels para mostrar en UI
export const CARATULA_LABELS: Record<CaratulaTipo, string> = {
  rescate: 'Rescate',
  fallecimiento_ahogamiento: 'Fallecimiento por Ahogamiento',
  hallazgo_cuerpo_nn: 'Hallazgo de Cuerpo Humano (N.N.)',
};

export const UNIDAD_REGIONAL_LABELS: Record<UnidadRegional, string> = {
  URN: 'Unidad Regional Norte',
  URS: 'Unidad Regional Sur',
  URE: 'Unidad Regional Este',
  URO: 'Unidad Regional Oeste',
};
