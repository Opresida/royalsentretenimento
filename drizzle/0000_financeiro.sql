CREATE TABLE "fin_admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario" text NOT NULL,
	"nome" text NOT NULL,
	"senha_hash" text NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"convite" text,
	"convite_expira" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_comprovantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"mime" text NOT NULL,
	"tamanho" integer NOT NULL,
	"dados" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_eventos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"data" text,
	"local" text,
	"status" text DEFAULT 'montagem' NOT NULL,
	"taxa_tipo" text DEFAULT 'nenhuma' NOT NULL,
	"taxa_valor" bigint DEFAULT 0 NOT NULL,
	"observacoes" text,
	"fechado_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_historico" (
	"id" serial PRIMARY KEY NOT NULL,
	"evento_id" integer,
	"admin_id" integer,
	"acao" text NOT NULL,
	"detalhe" jsonb,
	"em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_lancamentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"evento_id" integer,
	"tipo" text NOT NULL,
	"descricao" text NOT NULL,
	"categoria" text NOT NULL,
	"valor" bigint NOT NULL,
	"quitado" boolean DEFAULT true NOT NULL,
	"data" text NOT NULL,
	"vencimento" text,
	"comprovante_id" integer,
	"mostrar_ao_socio" boolean DEFAULT false NOT NULL,
	"origem" text DEFAULT 'manual' NOT NULL,
	"origem_evento_id" integer,
	"criado_por" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_socios" (
	"id" serial PRIMARY KEY NOT NULL,
	"evento_id" integer NOT NULL,
	"nome" text NOT NULL,
	"contato" text,
	"aporte" bigint DEFAULT 0 NOT NULL,
	"cota_bp" integer DEFAULT 0 NOT NULL,
	"e_royals" boolean DEFAULT false NOT NULL,
	"token" text NOT NULL,
	"link_ativo" boolean DEFAULT true NOT NULL,
	"ultimo_acesso" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fin_lancamentos" ADD CONSTRAINT "fin_lancamentos_evento_id_fin_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."fin_eventos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_lancamentos" ADD CONSTRAINT "fin_lancamentos_comprovante_id_fin_comprovantes_id_fk" FOREIGN KEY ("comprovante_id") REFERENCES "public"."fin_comprovantes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_socios" ADD CONSTRAINT "fin_socios_evento_id_fin_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."fin_eventos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "fin_admins_usuario" ON "fin_admins" USING btree ("usuario");--> statement-breakpoint
CREATE INDEX "fin_hist_evento" ON "fin_historico" USING btree ("evento_id");--> statement-breakpoint
CREATE INDEX "fin_lanc_evento" ON "fin_lancamentos" USING btree ("evento_id");--> statement-breakpoint
CREATE INDEX "fin_lanc_data" ON "fin_lancamentos" USING btree ("data");--> statement-breakpoint
CREATE UNIQUE INDEX "fin_socios_token" ON "fin_socios" USING btree ("token");--> statement-breakpoint
CREATE INDEX "fin_socios_evento" ON "fin_socios" USING btree ("evento_id");