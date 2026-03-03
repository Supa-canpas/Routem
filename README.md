@next-project-basis 

**使用方法**
**この右上のuse Templateボタンを押して、このリポジトリをtemplateとして利用すること。**

Next.jsを用いるプロジェクトのbasis
基本的なnextの開発環境と、各種APIを起動するためのdockerの設定ファイルが含まれる。
それぞれの環境での起動には.env系ファイルが必要であるため、提供するリンクからこれをダウンロードしルートディレクトリに配置する。

**APIについて**
RESTAPIに基づいて、./users/route.tsの中身は、get post delete put patchなどで何をするかを書く。
apiに何をするかを含めず、リクエストで指定することができて、/apiが肥大化しない。
それぞれに対応する処理は、libにまとめること。
また、型はzodでschemaを組んでフロントがインポートするだけでよいようにする。

**環境変数について**（※今後変更する可能性あり）

用いる.env系のファイルによって変更する。例としてnextをローカルで起動するデフォルトの開発環境では.env、nextをdocker上で起動する場合は.env.stage、本番環境では.env.productionをもちいる。

プロジェクト内での環境変数の取得関数はlib/configディレクトリ内のファイルclient.ts、server.tsに用いる場所によって定義し、そこでNODE_ENVによる変数の切り替えを定義する。

例:S3URLの取得

const getS3URL = () => {
    return process.env.s3URL
}

docker-compose.ymlファイルで読み込む.env系ファイルを切り替える。

また、クライアントサイドで用いる変数はこの命名規則に加えて最前部にNEXT_PUBLICが付く。

例:NEXT_PUBLIC_DEV_S3URL

# CORDING　STANDARD
**命名規則**
DBカラム名：キャメルケース
クエリパラメータ：キャメルケース
**宣言の並び順**
- できるだけ使用する直前で宣言
- 型なども同じであるが、特に理由がない場合は、アルファベット順で並べる
→ctrl shift P　でコマンドパレットを開き、sort ascendingで選択範囲を並び替えることができる

# vercelでの運用
- vercelでは異なるenvを使用することで、仮運用しています。
(MINIO系→Supabase storage,DATABASE_URL等→Supabaseのエンドポイント)
