CREATE TABLE "fin_serie_custos" (
	"id" serial PRIMARY KEY NOT NULL,
	"serie_id" integer NOT NULL,
	"descricao" text NOT NULL,
	"categoria" text NOT NULL,
	"valor" bigint NOT NULL,
	"quantidade" numeric(14, 3),
	"valor_unitario" numeric(16, 4),
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_serie_socios" (
	"id" serial PRIMARY KEY NOT NULL,
	"serie_id" integer NOT NULL,
	"nome" text NOT NULL,
	"contato" text,
	"aporte" bigint DEFAULT 0 NOT NULL,
	"cota_bp" integer DEFAULT 0 NOT NULL,
	"e_royals" boolean DEFAULT false NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"token" text NOT NULL,
	"link_ativo" boolean DEFAULT true NOT NULL,
	"ultimo_acesso" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_series" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"frequencia" text DEFAULT 'semanal' NOT NULL,
	"primeira_data" text,
	"local" text,
	"taxa_tipo" text DEFAULT 'nenhuma' NOT NULL,
	"taxa_valor" bigint DEFAULT 0 NOT NULL,
	"observacoes" text,
	"ativa" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fin_eventos" ADD COLUMN "serie_id" integer;--> statement-breakpoint
ALTER TABLE "fin_eventos" ADD COLUMN "edicao" integer;--> statement-breakpoint
ALTER TABLE "fin_socios" ADD COLUMN "serie_socio_id" integer;--> statement-breakpoint
ALTER TABLE "fin_serie_custos" ADD CONSTRAINT "fin_serie_custos_serie_id_fin_series_id_fk" FOREIGN KEY ("serie_id") REFERENCES "public"."fin_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_serie_socios" ADD CONSTRAINT "fin_serie_socios_serie_id_fin_series_id_fk" FOREIGN KEY ("serie_id") REFERENCES "public"."fin_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fin_serie_custos_serie" ON "fin_serie_custos" USING btree ("serie_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fin_serie_socios_token" ON "fin_serie_socios" USING btree ("token");--> statement-breakpoint
CREATE INDEX "fin_serie_socios_serie" ON "fin_serie_socios" USING btree ("serie_id");--> statement-breakpoint
CREATE INDEX "fin_eventos_serie" ON "fin_eventos" USING btree ("serie_id");